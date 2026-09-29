import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Subtask } from './entities/subtask.entity';
import { SubtasksService } from './subtasks.service';
import { Should } from '../common/fluent-assertions';

/**
 * ============================================================================
 * SUITE DE PRUEBAS DE REGRESIÓN — F22: DESGLOSAR TAREAS EN SUBTAREAS CON AVANCE
 * ============================================================================
 * Objetivo de Regresión:
 * Garantizar que modificaciones futuras en las entidades, lógica de negocio,
 * cálculo de porcentajes, normalización de posiciones o controles de acceso
 * multiusuario (anti-IDOR) no degraden ni introduzcan errores en la gestión
 * de subtareas y el cálculo del progreso porcentual de la entrega.
 */
describe('F22 Regression Suite: Desglosar tareas en subtareas con avance porcentual (Backend)', () => {
  let service: SubtasksService;

  const userOwner = { id: 10, name: 'Estudiante Autorizado' };
  const userAttacker = { id: 99, name: 'Usuario No Autorizado' };

  const assignmentOwner = {
    id: 50,
    title: 'Proyecto de Semestre',
    user: userOwner,
  } as Assignment;

  const mockSubtaskRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockAssignmentRepo = {
    findOne: jest.fn(),
  };

  function createSubtaskEntity(overrides: Partial<Subtask> = {}): Subtask {
    return {
      id: 1,
      title: 'Subtarea por defecto',
      completed: false,
      position: 0,
      assignment: assignmentOwner,
      ...overrides,
    } as Subtask;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        {
          provide: getRepositoryToken(Subtask),
          useValue: mockSubtaskRepo,
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockAssignmentRepo,
        },
      ],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 1: Cálculo Matemático y Reglas de Dominio del Progreso Porcentual
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 1: Dominio Matemático del Avance Porcentual (progress)', () => {
    it('debe retornar progress = 0 sin arrojar NaN o divisiones por cero cuando la entrega no tiene subtareas', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      mockSubtaskRepo.find.mockResolvedValue([]);

      const result = await service.getByAssignment(userOwner.id, assignmentOwner.id);

      result.status.Should().Be(200);
      result.data!.subtasks.Should().BeEmpty();
      result.data!.progress.Should().Be(0);
    });

    it('debe redondear matemáticamente al entero más cercano (Math.round) en fracciones no exactas', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);

      // Caso 1: 1 completada de 3 -> 33.333% -> 33%
      const threeItemsOneDone = [
        createSubtaskEntity({ id: 1, completed: true }),
        createSubtaskEntity({ id: 2, completed: false }),
        createSubtaskEntity({ id: 3, completed: false }),
      ];
      mockSubtaskRepo.find.mockResolvedValueOnce(threeItemsOneDone);
      const res1 = await service.getByAssignment(userOwner.id, assignmentOwner.id);
      res1.data!.progress.Should().Be(33);

      // Caso 2: 2 completadas de 3 -> 66.666% -> 67%
      const threeItemsTwoDone = [
        createSubtaskEntity({ id: 1, completed: true }),
        createSubtaskEntity({ id: 2, completed: true }),
        createSubtaskEntity({ id: 3, completed: false }),
      ];
      mockSubtaskRepo.find.mockResolvedValueOnce(threeItemsTwoDone);
      const res2 = await service.getByAssignment(userOwner.id, assignmentOwner.id);
      res2.data!.progress.Should().Be(67);

      // Caso 3: 5 completadas de 6 -> 83.333% -> 83%
      const sixItemsFiveDone = [
        createSubtaskEntity({ id: 1, completed: true }),
        createSubtaskEntity({ id: 2, completed: true }),
        createSubtaskEntity({ id: 3, completed: true }),
        createSubtaskEntity({ id: 4, completed: true }),
        createSubtaskEntity({ id: 5, completed: true }),
        createSubtaskEntity({ id: 6, completed: false }),
      ];
      mockSubtaskRepo.find.mockResolvedValueOnce(sixItemsFiveDone);
      const res3 = await service.getByAssignment(userOwner.id, assignmentOwner.id);
      res3.data!.progress.Should().Be(83);
    });

    it('debe retornar exactamente 100% cuando todas las subtareas se encuentran completadas', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      const allDone = [
        createSubtaskEntity({ id: 1, completed: true }),
        createSubtaskEntity({ id: 2, completed: true }),
      ];
      mockSubtaskRepo.find.mockResolvedValue(allDone);

      const result = await service.getByAssignment(userOwner.id, assignmentOwner.id);
      result.data!.progress.Should().Be(100);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 2: Integridad y Consistencia Posicional en Reordenamiento
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 2: Integridad Estricta en Reordenamiento de Subtareas', () => {
    it('debe actualizar orden con posiciones consecutivas 0..n-1 cuando los IDs son consistentes', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      const existing = [
        createSubtaskEntity({ id: 101, position: 0 }),
        createSubtaskEntity({ id: 102, position: 1 }),
        createSubtaskEntity({ id: 103, position: 2 }),
      ];
      // getByAssignment se llama al final para refrescar la lista
      mockSubtaskRepo.find.mockResolvedValue(existing);
      mockSubtaskRepo.update.mockResolvedValue({ affected: 1 } as any);

      // Reordenar invertido: 103, 101, 102
      const result = await service.reorder(userOwner.id, assignmentOwner.id, {
        orderedIds: [103, 101, 102],
      });

      Should(mockSubtaskRepo.update).HaveBeenCalledTimes(3);
      Should(mockSubtaskRepo.update).HaveBeenCalledWith(103, { position: 0 });
      Should(mockSubtaskRepo.update).HaveBeenCalledWith(101, { position: 1 });
      Should(mockSubtaskRepo.update).HaveBeenCalledWith(102, { position: 2 });
      result.status.Should().Be(200);
    });

    it('debe rechazar atómicamente con ForbiddenException si orderedIds incluye un ID ajeno o duplicado', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      const existing = [
        createSubtaskEntity({ id: 101, position: 0 }),
        createSubtaskEntity({ id: 102, position: 1 }),
      ];
      mockSubtaskRepo.find.mockResolvedValue(existing);

      // Intento de inyectar ID ajeno 999
      await Should(async () =>
        service.reorder(userOwner.id, assignmentOwner.id, {
          orderedIds: [101, 999],
        }),
      ).ThrowAsync(ForbiddenException);

      // Intento con longitud incorrecta (falta un elemento)
      await Should(async () =>
        service.reorder(userOwner.id, assignmentOwner.id, {
          orderedIds: [101],
        }),
      ).ThrowAsync('The subtask order must belong to this assignment');

      Should(mockSubtaskRepo.update).NotHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 3: Compactación y Normalización de Posiciones al Eliminar
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 3: Compactación Posicional al Eliminar Subtareas', () => {
    it('debe renumerar las subtareas restantes sin dejar huecos en la secuencia de posiciones', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      const targetSubtask = createSubtaskEntity({ id: 102, position: 1 });
      mockSubtaskRepo.findOne.mockResolvedValue(targetSubtask);
      mockSubtaskRepo.remove.mockResolvedValue(targetSubtask);

      // Tras remover la intermedia (id 102), quedan 101 y 103
      const remainingSubtasks = [
        createSubtaskEntity({ id: 101, position: 0 }),
        createSubtaskEntity({ id: 103, position: 2 }), // posición vieja era 2
      ];
      mockSubtaskRepo.find.mockResolvedValue(remainingSubtasks);
      mockSubtaskRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.remove(userOwner.id, assignmentOwner.id, 102);

      Should(mockSubtaskRepo.remove).HaveBeenCalledWith(targetSubtask);
      Should(mockSubtaskRepo.update).HaveBeenCalledTimes(2);
      Should(mockSubtaskRepo.update).HaveBeenCalledWith(101, { position: 0 });
      Should(mockSubtaskRepo.update).HaveBeenCalledWith(103, { position: 1 }); // Renumerado a 1
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 4: Control de Acceso y Prevención de IDOR (Aislamiento de Usuario)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 4: Aislamiento Multiusuario y Rechazo IDOR', () => {
    it('debe impedir que un usuario acceda o modifique subtareas de una entrega que no le pertenece', async () => {
      // El usuario en la entrega es userOwner (id: 10), pero quien hace la petición es userAttacker (id: 99)
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);

      // getByAssignment
      await Should(async () =>
        service.getByAssignment(userAttacker.id, assignmentOwner.id),
      ).ThrowAsync(ForbiddenException);

      // create
      await Should(async () =>
        service.create(userAttacker.id, assignmentOwner.id, {
          title: 'Subtarea intrusa',
        }),
      ).ThrowAsync('You cannot access this assignment');

      // reorder
      await Should(async () =>
        service.reorder(userAttacker.id, assignmentOwner.id, {
          orderedIds: [1, 2],
        }),
      ).ThrowAsync(ForbiddenException);

      Should(mockSubtaskRepo.save).NotHaveBeenCalled();
    });

    it('debe responder 404 Not Found si la entrega solicitada no existe en la base de datos', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(null);

      await Should(async () =>
        service.getByAssignment(userOwner.id, 9999),
      ).ThrowAsync(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 5: Sanitización de Título y Validación de Espacios en Blanco
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 5: Validación y Sanitización de Títulos (Trim Invariant)', () => {
    it('debe rechazar con BadRequestException títulos vacíos o que solo contienen espacios', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);

      // Caso vacío
      await Should(async () =>
        service.create(userOwner.id, assignmentOwner.id, { title: '' }),
      ).ThrowAsync('The subtask title cannot be empty');

      // Caso solo espacios en blanco
      await Should(async () =>
        service.create(userOwner.id, assignmentOwner.id, { title: '     ' }),
      ).ThrowAsync(BadRequestException);

      Should(mockSubtaskRepo.save).NotHaveBeenCalled();
    });

    it('debe sanitizar con trim() los títulos con espacios en los extremos antes de guardar', async () => {
      mockAssignmentRepo.findOne.mockResolvedValue(assignmentOwner);
      mockSubtaskRepo.count.mockResolvedValue(0);
      mockSubtaskRepo.create.mockImplementation((dto) => dto);
      mockSubtaskRepo.save.mockResolvedValue({ id: 1 });
      mockSubtaskRepo.find.mockResolvedValue([]);

      await service.create(userOwner.id, assignmentOwner.id, {
        title: '   Redacción de Introducción y Objetivos   ',
      });

      Should(mockSubtaskRepo.create).HaveBeenCalledWith(
        expect.objectContaining({
          title: 'Redacción de Introducción y Objetivos',
          position: 0,
        }),
      );
    });
  });
});
