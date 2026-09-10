import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { UsersService } from 'src/users/users.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { NotFoundException } from '@nestjs/common';

/**
 * Pruebas unitarias de AssignmentsService, construidas a partir de la hoja
 * "Tablas de caminos" del archivo Formato_Casos_y_Escenarios_de_Pruebas.
 *
 * Cada bloque describe() corresponde a una de las 5 funcionalidades del
 * backend de Tareas. Cada it() referencia el "Camino" (secuencia de nodos),
 * "Entrada" y "Salida" tal como están documentados en la tabla, para
 * mantener trazabilidad prueba <-> camino.
 *
 * "Editar tarea (Backend)" NO tenía tabla de caminos en el Excel (solo existe
 * la de Frontend). Los caminos usados en ese bloque están INFERIDOS del
 * código, siguiendo el mismo patrón que "Editar asignatura académica
 * (Backend)" (preload -> si no existe, NotFoundException; si existe, save y
 * 200), y quedan marcados explícitamente como inferidos.
 */

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed',
};

const mockSubject = {
  id: 10,
  name: 'Math',
  professor: 'Dr. Smith',
  color: '#ff0000',
  user: mockUser,
};

const mockAssignment: Partial<Assignment> = {
  id: 100,
  title: 'Tarea 1',
  description: 'Ejercicios del capítulo 3',
  dueDate: '2025-06-01T00:00:00',
  user: mockUser as any,
  subject: mockSubject as any,
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockAssignmentRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  preload: jest.fn(),
};

const mockUsersService = {
  findOneById: jest.fn(),
};

const mockSubjectsService = {
  getSubjectById: jest.fn(),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SubjectsService, useValue: mockSubjectsService },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 1. Listar tareas (Backend) → getAssignmentsByUser
  // ═══════════════════════════════════════════════════════════════════════
  describe('getAssignmentsByUser (Listar tareas)', () => {
    // Camino: 1,2,3,4,6,7
    // Entrada: Se recibe la petición, se consulta GetAssignments.use(userId)
    // Prueba: Hay tarea? = No
    // Salida: return "user has not Assignments" (mensaje equivalente en código: "No assignments found for this user")
    it('[Camino 1,2,3,4,6,7] debe retornar mensaje de "sin tareas" cuando el usuario no tiene tareas', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.getAssignmentsByUser(1);

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
      });
      expect(result.status).toBe(200);
      expect(result.message).toMatch(/no assignments found/i);
      expect(result.data).toEqual([]);
    });

    // Camino: 1,2,3,4,5,7
    // Entrada: Se recibe la petición, se consulta GetAssignments.use(userId)
    // Prueba: Hay tareas? = Sí
    // Salida: GetAssignmentsBySubject -> fin (mapeo a AssignmentResponseCompDto con subjectName)
    it('[Camino 1,2,3,4,5,7] debe retornar las tareas del usuario mapeadas con subjectName', async () => {
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      const result = await service.getAssignmentsByUser(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 100,
        title: 'Tarea 1',
        subjectId: 10,
        subjectName: 'Math',
      });
    });

    it('debe usar cadena vacía como descripción cuando esta es undefined', async () => {
      const noDesc = { ...mockAssignment, description: undefined };
      mockAssignmentRepository.find.mockResolvedValue([noDesc]);

      const result = await service.getAssignmentsByUser(1);

      expect(result.data![0].description).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 2. Consultar tarea por asignatura (Backend) → getAssignmentsBySubject
  // ═══════════════════════════════════════════════════════════════════════
  describe('getAssignmentsBySubject (Consultar tarea por asignatura)', () => {
    // Camino: 1,2,3,4,6,7
    // Entrada: Se busca la materia y se consultan sus tareas
    // Prueba: Hay tareas? = No
    // Salida: Return [] -> fin
    it('[Camino 1,2,3,4,6,7] debe retornar arreglo vacío cuando la materia no tiene tareas', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 }, subject: { id: 10 } },
      });
      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    // Camino: 1,2,3,4,5,7
    // Entrada: Se busca la materia y se consultan sus tareas
    // Prueba: Hay tareas? = Sí
    // Salida: Assignments -> fin
    it('[Camino 1,2,3,4,5,7] debe retornar las tareas de la materia especificada', async () => {
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 100,
        title: 'Tarea 1',
        subjectId: 10,
      });
    });

    it('debe usar cadena vacía como descripción cuando esta es undefined', async () => {
      const noDesc = { ...mockAssignment, description: undefined };
      mockAssignmentRepository.find.mockResolvedValue([noDesc]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(result.data![0].description).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Registrar tarea (Backend) → addAssignment
  // ═══════════════════════════════════════════════════════════════════════
  describe('addAssignment (Registrar tarea)', () => {
    const addDto = {
      title: 'Nueva tarea',
      description: 'Descripción',
      dueDate: '2025-07-01T00:00:00',
    };

    // Camino: 1,2,3,4,6,10
    // Entrada: Petición POST recibida, se busca el usuario (Get assignments(userId))
    // Prueba: Hay user? = No
    // Salida: NotFoundException -> fin [Assignments create]
    it('[Camino 1,2,3,4,6,10] debe lanzar NotFoundException cuando el usuario no existe', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);
      mockSubjectsService.getSubjectById.mockResolvedValue(mockSubject);

      await expect(service.addAssignment(999, 10, addDto)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.create).not.toHaveBeenCalled();
    });

    // Camino: 1,2,3,4,5,7,6,10
    // Entrada: Usuario existe, se busca la materia (Getsubject(subjectId))
    // Prueba: Hay user? = Sí; Hay subject? = No
    // Salida: NotFoundException -> fin [Assignments create]
    it('[Camino 1,2,3,4,5,7,6,10] debe lanzar NotFoundException cuando la materia no existe', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectsService.getSubjectById.mockResolvedValue(null);

      await expect(service.addAssignment(1, 999, addDto)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.create).not.toHaveBeenCalled();
    });

    // Camino: 1,2,3,4,5,7,8,9,10
    // Entrada: Usuario y materia existen
    // Prueba: Hay user? = Sí; Hay subject? = Sí
    // Salida: Assignment repository.create -> Save -> fin [Assignments create] (status 201)
    it('[Camino 1,2,3,4,5,7,8,9,10] debe crear la tarea y retornar status 201 cuando usuario y materia existen', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectsService.getSubjectById.mockResolvedValue(mockSubject);
      mockAssignmentRepository.create.mockReturnValue(mockAssignment);
      mockAssignmentRepository.save.mockResolvedValue(mockAssignment);

      const result = await service.addAssignment(1, 10, addDto);

      expect(result.status).toBe(201);
      expect(mockAssignmentRepository.create).toHaveBeenCalledWith({
        title: addDto.title,
        description: addDto.description,
        dueDate: addDto.dueDate,
        user: mockUser,
        subject: mockSubject,
      });
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith(mockAssignment);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 4. Eliminar tarea (Backend) → deleteAssignment
  // ═══════════════════════════════════════════════════════════════════════
  describe('deleteAssignment (Eliminar tarea)', () => {
    // Camino: 1,2,3,4,5,7,8
    // Entrada: Petición DELETE recibida, se busca la tarea por id
    // Prueba: Hay assignment del usuario? = No
    // Salida: Not found exception -> fin
    it('[Camino 1,2,3,4,5,7,8] debe lanzar NotFoundException cuando la tarea no existe', async () => {
      mockAssignmentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.deleteAssignment(999)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.delete).not.toHaveBeenCalled();
    });

    // Camino: 1,2,3,4,5,6,8
    // Entrada: Petición DELETE recibida, se busca la tarea por id
    // Prueba: Hay assignment del usuario? = Sí
    // Salida: delete -> fin (status 200)
    it('[Camino 1,2,3,4,5,6,8] debe eliminar la tarea y retornar status 200 cuando existe', async () => {
      mockAssignmentRepository.findOneBy.mockResolvedValue(mockAssignment);
      mockAssignmentRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteAssignment(100);

      expect(result.status).toBe(200);
      expect(mockAssignmentRepository.delete).toHaveBeenCalledWith(100);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 5. Editar tarea (Backend) → editAssignment
  //    ⚠ Sin tabla de caminos en el Excel (solo existe la de Frontend).
  //    Caminos INFERIDOS del código, análogos a "Editar asignatura
  //    académica (Backend)": preload() fusiona id + dto; si no encuentra
  //    la entidad retorna undefined -> NotFoundException; si la encuentra,
  //    hace save() y retorna 200.
  // ═══════════════════════════════════════════════════════════════════════
  describe('editAssignment (Editar tarea) — caminos inferidos', () => {
    const updateDto = { title: 'Tarea actualizada' };

    // Camino inferido: preload(...) retorna undefined (Hay assignment? = No)
    // Salida: NotFoundException -> fin
    it('[Camino inferido] debe lanzar NotFoundException cuando la tarea no existe', async () => {
      mockAssignmentRepository.preload.mockResolvedValue(undefined);

      await expect(service.editAssignment(999, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.preload).toHaveBeenCalledWith({
        id: 999,
        ...updateDto,
      });
      expect(mockAssignmentRepository.save).not.toHaveBeenCalled();
    });

    // Camino inferido: preload(...) encuentra y fusiona la entidad (Hay assignment? = Sí)
    // Salida: save() -> return { status: 200, message: 'Assignment updated successfully' }
    it('[Camino inferido] debe actualizar la tarea y retornar status 200 cuando existe', async () => {
      const preloaded = { ...mockAssignment, ...updateDto };
      mockAssignmentRepository.preload.mockResolvedValue(preloaded);
      mockAssignmentRepository.save.mockResolvedValue(preloaded);

      const result = await service.editAssignment(100, updateDto);

      expect(result.status).toBe(200);
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith(preloaded);
    });
  });
});
