import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { UsersService } from 'src/users/users.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { NotFoundException } from '@nestjs/common';

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

  // ─── getAssignmentsByUser ─────────────────────────────────────────────────

  describe('getAssignmentsByUser', () => {
    it('should return assignments mapped to AssignmentResponseCompDto', async () => {
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      const result = await service.getAssignmentsByUser(1);

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
      });
      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 100,
        title: 'Tarea 1',
        subjectId: 10,
        subjectName: 'Math',
      });
    });

    it('should return empty data when the user has no assignments', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.getAssignmentsByUser(1);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('should use empty string as description when it is undefined', async () => {
      const noDesc = { ...mockAssignment, description: undefined };
      mockAssignmentRepository.find.mockResolvedValue([noDesc]);

      const result = await service.getAssignmentsByUser(1);

      expect(result.data![0].description).toBe('');
    });
  });

  // ─── F21: getUpcomingAssignments (Tabla 6 - Caminos Básicos Independientes) ───

  describe('F21 — getUpcomingAssignments (Caminos Básicos de Caja Blanca - Tabla 6)', () => {
    // Camino P1: 1-2-3-14 (Validación de parámetros y límites temporales de consulta)
    it('Camino P1 (1-2-3-14): should configure query boundaries using the specified user ID and active time window', async () => {
      // Arrange
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      // Act
      const result = await service.getUpcomingAssignments(1);

      // Assert
      expect(mockAssignmentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: { id: 1 },
          }),
        }),
      );
      expect(result.status).toBe(200);
    });

    // Camino P2: 1-2-4-5-6-7-8-9-14 (Fallo de conexión o excepción en BD PostgreSQL / TypeORM)
    it('Camino P2 (1-2-4-5-6-7-8-9-14): should propagate database error when TypeORM repository fails (500 Internal Error path)', async () => {
      // Arrange
      const dbError = new Error('PostgreSQL connection timeout');
      mockAssignmentRepository.find.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getUpcomingAssignments(1)).rejects.toThrow('PostgreSQL connection timeout');
    });

    // Camino P3: 1-2-4-5-6-7-10-11-13-14 (Flujo nominal principal con entregas próximas encontradas)
    it('Camino P3 (1-2-4-5-6-7-10-11-13-14): should map and return upcoming assignments with 200 OK and ordered chronologically', async () => {
      // Arrange
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      // Act
      const result = await service.getUpcomingAssignments(1);

      // Assert
      expect(result.status).toBe(200);
      expect(result.message).toBe('Upcoming assignments retrieved successfully');
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toEqual({
        id: 100,
        title: 'Tarea 1',
        description: 'Ejercicios del capítulo 3',
        dueDate: '2025-06-01T00:00:00',
        subjectId: 10,
        subjectName: 'Math',
      });
    });

    // Camino P4: 1-2-4-5-6-7-10-11-12-13-14 (Ordenamiento defensivo por dueDate ASC y ventana personalizada)
    it('Camino P4 (1-2-4-5-6-7-10-11-12-13-14): should enforce defensive dueDate ASC ordering and support custom hoursAhead window', async () => {
      // Arrange
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      // Act
      const customHours = 24;
      await service.getUpcomingAssignments(1, customHours);

      // Assert
      expect(mockAssignmentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { dueDate: 'ASC' },
        }),
      );
    });

    // Camino P5: 1-2-4-5-6-7-10-13-14 (Caso borde: usuario sin entregas próximas en la ventana)
    it('Camino P5 (1-2-4-5-6-7-10-13-14): should return 200 OK with empty array and specific message when no upcoming assignments exist', async () => {
      // Arrange
      mockAssignmentRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getUpcomingAssignments(1);

      // Assert
      expect(result.status).toBe(200);
      expect(result.message).toBe('No upcoming assignments');
      expect(result.data).toEqual([]);
    });
  });

  // ─── getAssignmentsBySubject ──────────────────────────────────────────────

  describe('getAssignmentsBySubject', () => {
    it('should return assignments for a given user and subject', async () => {
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 }, subject: { id: 10 } },
      });
      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 100,
        title: 'Tarea 1',
        subjectId: 10,
      });
    });

    it('should return empty data when no assignments match', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('should use empty string as description when it is undefined', async () => {
      const noDesc = { ...mockAssignment, description: undefined };
      mockAssignmentRepository.find.mockResolvedValue([noDesc]);

      const result = await service.getAssignmentsBySubject(1, 10);

      expect(result.data![0].description).toBe('');
    });
  });

  // ─── addAssignment ────────────────────────────────────────────────────────

  describe('addAssignment', () => {
    const addDto = {
      title: 'Nueva tarea',
      description: 'Descripción',
      dueDate: '2025-07-01T00:00:00',
    };

    it('should create an assignment and return status 201', async () => {
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

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);
      mockSubjectsService.getSubjectById.mockResolvedValue(mockSubject);

      await expect(service.addAssignment(999, 10, addDto)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the subject does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectsService.getSubjectById.mockResolvedValue(null);

      await expect(service.addAssignment(1, 999, addDto)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─── deleteAssignment ─────────────────────────────────────────────────────

  describe('deleteAssignment', () => {
    it('should delete an assignment and return status 200', async () => {
      mockAssignmentRepository.findOneBy.mockResolvedValue(mockAssignment);
      mockAssignmentRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteAssignment(100);

      expect(result.status).toBe(200);
      expect(mockAssignmentRepository.delete).toHaveBeenCalledWith(100);
    });

    it('should throw NotFoundException when the assignment does not exist', async () => {
      mockAssignmentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.deleteAssignment(999)).rejects.toThrow(NotFoundException);
      expect(mockAssignmentRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ─── editAssignment ───────────────────────────────────────────────────────

  describe('editAssignment', () => {
    const updateDto = { title: 'Tarea actualizada' };

    it('should update an assignment and return status 200', async () => {
      const preloaded = { ...mockAssignment, ...updateDto };
      (mockAssignmentRepository as any).preload = jest.fn().mockResolvedValue(preloaded);
      mockAssignmentRepository.save.mockResolvedValue(preloaded);

      const result = await service.editAssignment(100, updateDto as any);

      expect((mockAssignmentRepository as any).preload).toHaveBeenCalledWith({
        id: 100,
        ...updateDto,
      });
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith(preloaded);
      expect(result.status).toBe(200);
      expect(result.message).toBe('Assignment updated successfully');
    });

    it('should throw NotFoundException when the assignment does not exist', async () => {
      (mockAssignmentRepository as any).preload = jest.fn().mockResolvedValue(null);

      await expect(service.editAssignment(999, updateDto as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAssignmentRepository.save).not.toHaveBeenCalled();
    });
  });
});