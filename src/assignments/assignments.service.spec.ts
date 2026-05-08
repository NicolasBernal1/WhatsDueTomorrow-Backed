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
  // No valida existencia del usuario: consulta directo al repo y
  // devuelve vacío si no hay resultados.

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

  // ─── getAssignmentsBySubject ──────────────────────────────────────────────
  // Igual que el anterior: no valida usuario ni materia,
  // filtra directamente por where.

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
  // Primero busca usuario y materia, luego valida con if(!user)/if(!subject).

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
      // getSubjectById puede retornar lo que sea; el if(!user) llega primero
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
});