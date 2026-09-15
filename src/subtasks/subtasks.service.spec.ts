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

describe('SubtasksService (F22 — Desglosar tareas en subtareas con avance porcentual - Tabla 12)', () => {
  let service: SubtasksService;

  const mockUser = { id: 1, name: 'Estudiante Prueba' };
  const mockAssignment = { id: 10, user: mockUser } as Assignment;
  const mockOtherUserAssignment = { id: 10, user: { id: 999 } } as Assignment;

  const mockSubtask1: Subtask = {
    id: 101,
    title: 'Investigación bibliográfica',
    completed: true,
    position: 0,
    assignment: mockAssignment,
  } as Subtask;

  const mockSubtask2: Subtask = {
    id: 102,
    title: 'Diseño de arquitectura',
    completed: false,
    position: 1,
    assignment: mockAssignment,
  } as Subtask;

  const mockSubtaskRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockAssignmentRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        { provide: getRepositoryToken(Subtask), useValue: mockSubtaskRepository },
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepository },
      ],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio de subtareas', () => {
    expect(service).toBeDefined();
  });

  // ─── TABLA 12: CAMINOS BÁSICOS INDEPENDIENTES (BACKEND F22) ──────────────────

  // Camino P1: 1-2-3-21 (Verificación de guardia JWT en capa de servicio/controlador)
  it('Camino P1 (1-2-3-21): debe rechazar peticiones no autenticadas cuando falta la identidad del usuario', async () => {
    // Si userId es indefinido o nulo, la validación de propiedad debe fallar
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    await expect(service.getByAssignment(undefined as any, 10)).rejects.toThrow(
      ForbiddenException,
    );
  });

  // Camino P2: 1-2-4-5-6-21 (assignmentId no existe en PostgreSQL)
  it('Camino P2 (1-2-4-5-6-21): debe retornar 404 Not Found si la entrega (assignment) no existe', async () => {
    // Arrange: assignmentRepository retorna null
    mockAssignmentRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(service.getByAssignment(1, 999)).rejects.toThrow(
      new NotFoundException('The assignment does not exist'),
    );
  });

  // Camino P3: 1-2-4-5-7-8-21 (La tarea existe pero pertenece a otro usuario - Anti-IDOR)
  it('Camino P3 (1-2-4-5-7-8-21): debe retornar 403 Forbidden si el usuario intenta acceder a una entrega ajena', async () => {
    // Arrange: assignment.user.id = 999, req.user = 1
    mockAssignmentRepository.findOne.mockResolvedValue(mockOtherUserAssignment);

    // Act & Assert
    await expect(service.getByAssignment(1, 10)).rejects.toThrow(
      new ForbiddenException('You cannot access this assignment'),
    );
    expect(mockSubtaskRepository.find).not.toHaveBeenCalled();
  });

  // Camino P4: 1-2-4-5-7-9-10-20-21 (Flujo nominal GET /subtasks con lista ordenada y avance porcentual)
  it('Camino P4 (1-2-4-5-7-9-10-20-21): debe retornar 200 OK con subtareas ordenadas y progreso porcentual exacto', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.find.mockResolvedValue([mockSubtask1, mockSubtask2]);

    // Act
    const result = await service.getByAssignment(1, 10);

    // Assert
    expect(result.status).toBe(200);
    expect(result.message).toBe('Subtasks retrieved successfully');
    expect(result.data?.subtasks).toHaveLength(2);
    // 1 de 2 completadas = 50%
    expect(result.data?.progress).toBe(50);
    expect(result.data?.subtasks[0].title).toBe('Investigación bibliográfica');
    expect(result.data?.subtasks[1].title).toBe('Diseño de arquitectura');
  });

  // Camino P5: 1-2-4-5-7-9-11-12-21 (POST con dto.title vacío o de solo espacios)
  it('Camino P5 (1-2-4-5-7-9-11-12-21): debe retornar 400 Bad Request si el título de la nueva subtarea está vacío', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);

    // Act & Assert
    await expect(service.create(1, 10, { title: '   ' })).rejects.toThrow(
      new BadRequestException('The subtask title cannot be empty'),
    );
    expect(mockSubtaskRepository.save).not.toHaveBeenCalled();
  });

  // Camino P6: 1-2-4-5-7-9-11-20-21 (POST con título válido y asignación de posición ordinal)
  it('Camino P6 (1-2-4-5-7-9-11-20-21): debe crear subtarea asignando position = count() y recalcular el progreso', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.count.mockResolvedValue(2);
    const newCreatedSubtask = {
      id: 103,
      title: 'Pruebas Unitarias',
      position: 2,
      assignment: mockAssignment,
    };
    mockSubtaskRepository.create.mockReturnValue(newCreatedSubtask);
    mockSubtaskRepository.save.mockResolvedValue(newCreatedSubtask);
    // getByAssignment posterior retorna las 3 subtareas
    mockSubtaskRepository.find.mockResolvedValue([mockSubtask1, mockSubtask2, { ...newCreatedSubtask, completed: false }]);

    // Act
    const result = await service.create(1, 10, { title: 'Pruebas Unitarias' });

    // Assert
    expect(mockSubtaskRepository.create).toHaveBeenCalledWith({
      title: 'Pruebas Unitarias',
      position: 2,
      assignment: mockAssignment,
    });
    expect(mockSubtaskRepository.save).toHaveBeenCalled();
    expect(result.status).toBe(200);
    // 1 de 3 completadas = Math.round(33.33) = 33%
    expect(result.data?.progress).toBe(33);
  });

  // Camino P7: 1-2-4-5-7-9-13-14-21 (PATCH :subtaskId no existe en la BD)
  it('Camino P7 (1-2-4-5-7-9-13-14-21): debe retornar 404 Not Found si la subtarea a modificar no existe', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(service.update(1, 10, 999, { completed: true })).rejects.toThrow(
      new NotFoundException('The subtask does not exist'),
    );
  });

  // Camino P8: 1-2-4-5-7-9-13-15-12-21 (PATCH :subtaskId con título vacío)
  it('Camino P8 (1-2-4-5-7-9-13-15-12-21): debe retornar 400 Bad Request si en la actualización se envía título vacío', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.findOne.mockResolvedValue({ ...mockSubtask1 });

    // Act & Assert
    await expect(service.update(1, 10, 101, { title: '   ' })).rejects.toThrow(
      new BadRequestException('The subtask title cannot be empty'),
    );
    expect(mockSubtaskRepository.save).not.toHaveBeenCalled();
  });

  // Camino P9: 1-2-4-5-7-9-13-15-20-21 (PATCH :subtaskId con completed o título válido)
  it('Camino P9 (1-2-4-5-7-9-13-15-20-21): debe actualizar estado completado o título y recalcular el avance porcentual', async () => {
    // Arrange
    const subtaskToUpdate = { ...mockSubtask2 };
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.findOne.mockResolvedValue(subtaskToUpdate);
    mockSubtaskRepository.save.mockResolvedValue({ ...subtaskToUpdate, completed: true });
    // getByAssignment posterior: ambas completadas (100%)
    mockSubtaskRepository.find.mockResolvedValue([mockSubtask1, { ...subtaskToUpdate, completed: true }]);

    // Act
    const result = await service.update(1, 10, 102, { completed: true });

    // Assert
    expect(mockSubtaskRepository.save).toHaveBeenCalled();
    expect(result.data?.progress).toBe(100);
  });

  // Camino P10: 1-2-4-5-7-9-16-14-21 (DELETE :subtaskId inexistente en BD)
  it('Camino P10 (1-2-4-5-7-9-16-14-21): debe retornar 404 Not Found si la subtarea a eliminar no existe', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(service.remove(1, 10, 999)).rejects.toThrow(
      new NotFoundException('The subtask does not exist'),
    );
  });

  // Camino P11: 1-2-4-5-7-9-16-17-20-21 (DELETE :subtaskId con reindexación posicional 0..N-1)
  it('Camino P11 (1-2-4-5-7-9-16-17-20-21): debe eliminar la subtarea, reindexar posiciones y retornar nuevo progreso', async () => {
    // Arrange
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.findOne.mockResolvedValue(mockSubtask1);
    mockSubtaskRepository.remove.mockResolvedValue(mockSubtask1);
    // remaining tras borrado de subtask1
    mockSubtaskRepository.find.mockResolvedValueOnce([mockSubtask2]); // remaining
    mockSubtaskRepository.update.mockResolvedValue({ affected: 1 });
    // getByAssignment posterior
    mockSubtaskRepository.find.mockResolvedValueOnce([mockSubtask2]);

    // Act
    const result = await service.remove(1, 10, 101);

    // Assert
    expect(mockSubtaskRepository.remove).toHaveBeenCalledWith(mockSubtask1);
    expect(mockSubtaskRepository.update).toHaveBeenCalledWith(mockSubtask2.id, { position: 0 });
    expect(result.status).toBe(200);
  });

  // Camino P12: 1-2-4-5-7-9-18-19-21 (PATCH /order con IDs ajenos o longitud mismatch)
  it('Camino P12 (1-2-4-5-7-9-18-19-21): debe retornar 403 Forbidden si los orderedIds no coinciden con las subtareas de la entrega', async () => {
    // Arrange: asignación tiene subtareas [101, 102], pero se envían [101, 999]
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.find.mockResolvedValue([mockSubtask1, mockSubtask2]);

    // Act & Assert
    await expect(
      service.reorder(1, 10, { orderedIds: [101, 999] }),
    ).rejects.toThrow(
      new ForbiddenException('The subtask order must belong to this assignment'),
    );
    expect(mockSubtaskRepository.update).not.toHaveBeenCalled();
  });

  // Camino P13: 1-2-4-5-7-9-18-20-21 (PATCH /order con IDs válidos y actualización en bloque)
  it('Camino P13 (1-2-4-5-7-9-18-20-21): debe actualizar posiciones según orderedIds con Promise.all y retornar orden persistido', async () => {
    // Arrange: invertir orden [102, 101]
    mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
    mockSubtaskRepository.find.mockResolvedValueOnce([mockSubtask1, mockSubtask2]);
    mockSubtaskRepository.update.mockResolvedValue({ affected: 1 });
    // getByAssignment posterior
    mockSubtaskRepository.find.mockResolvedValueOnce([
      { ...mockSubtask2, position: 0 },
      { ...mockSubtask1, position: 1 },
    ]);

    // Act
    const result = await service.reorder(1, 10, { orderedIds: [102, 101] });

    // Assert
    expect(mockSubtaskRepository.update).toHaveBeenCalledWith(102, { position: 0 });
    expect(mockSubtaskRepository.update).toHaveBeenCalledWith(101, { position: 1 });
    expect(result.status).toBe(200);
    expect(result.data?.subtasks[0].id).toBe(102);
  });
});
