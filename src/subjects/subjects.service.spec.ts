import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { ContradictoryTimeException } from './exceptions/contradictory-time.exception';

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed',
  subjects: [],
  assignments: [],
  subjectClasses: [],
};

const mockSubject: Subject = {
  id: 10,
  name: 'Math',
  professor: 'Dr. Smith',
  color: '#ff0000',
  user: mockUser as any,
  assignments: [],
  subjectClasses: [],
};

const mockSubjectClass: SubjectClass = {
  id: 20,
  dayOfWeek: 'Monday',
  startTime: '08:00',
  endTime: '10:00',
  subject: mockSubject,
  user: mockUser as any,
};

// ─── Mocks de repositorios y servicios ───────────────────────────────────────

const mockSubjectRepository = {
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockSubjectClassRepository = {
  findBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockUsersService = {
  findOneById: jest.fn(),
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('SubjectsService', () => {
  let service: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getRepositoryToken(Subject), useValue: mockSubjectRepository },
        { provide: getRepositoryToken(SubjectClass), useValue: mockSubjectClassRepository },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getSubjects ─────────────────────────────────────────────────────────────

  describe('getSubjects', () => {
    it('should return subjects for an existing user', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.findBy.mockResolvedValue([mockSubject]);

      const result = await service.getSubjects(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({ id: 10, name: 'Math' });
    });

    it('should return empty data when the user has no subjects', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.findBy.mockResolvedValue([]);

      const result = await service.getSubjects(1);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.getSubjects(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getSubject (individual) ──────────────────────────────────────────────

  describe('getSubject', () => {
    it('should return subject data when the subject exists', async () => {
      mockSubjectRepository.findOneBy.mockResolvedValue(mockSubject);

      const result = await service.getSubject(10);

      expect(result.status).toBe(200);
      expect(result.data).toMatchObject({ id: 10, name: 'Math' });
    });

    it('should throw NotFoundException when the subject does not exist', async () => {
      mockSubjectRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getSubject(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── addSubject ───────────────────────────────────────────────────────────

  describe('addSubject', () => {
    const addDto = { name: 'Physics', professor: 'Dr. Jones', color: '#00ff00' };

    it('should create a subject and return status 201', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.create.mockReturnValue(mockSubject);
      mockSubjectRepository.save.mockResolvedValue(mockSubject);

      const result = await service.addSubject(1, addDto);

      expect(result.status).toBe(201);
      expect(mockSubjectRepository.create).toHaveBeenCalledWith({
        name: addDto.name,
        professor: addDto.professor,
        color: addDto.color,
        user: mockUser,
      });
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.addSubject(999, addDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove (subject) ────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a subject and return status 200', async () => {
      mockSubjectRepository.findOneBy.mockResolvedValue(mockSubject);
      mockSubjectRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(10);

      expect(result.status).toBe(200);
      expect(mockSubjectRepository.delete).toHaveBeenCalledWith(10);
    });

    it('should throw NotFoundException when the subject does not exist', async () => {
      mockSubjectRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getClassesByid ──────────────────────────────────────────────────────

  describe('getClassesByid', () => {
    it('should return classes for an existing user', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectClassRepository.findBy.mockResolvedValue([mockSubjectClass]);

      const result = await service.getClassesByid(1);

      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].dayOfWeek).toBe('Monday');
    });

    it('should return empty data when the user has no classes', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getClassesByid(1);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.getClassesByid(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── addClass ────────────────────────────────────────────────────────────

  describe('addClass', () => {
    const addClassDto = {
      subjectId: 10,
      dayOfWeek: 'Tuesday',
      startTime: '08:00',
      endTime: '10:00',
    };

    it('should create a class and return status 201', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.findOneBy.mockResolvedValue(mockSubject);
      mockSubjectClassRepository.create.mockReturnValue(mockSubjectClass);
      mockSubjectClassRepository.save.mockResolvedValue(mockSubjectClass);

      const result = await service.addClass(1, addClassDto);

      expect(result.status).toBe(201);
    });

    it('should throw ContradictoryTimeException when endTime < startTime', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.findOneBy.mockResolvedValue(mockSubject);

      await expect(
        service.addClass(1, { ...addClassDto, startTime: '10:00', endTime: '08:00' })
      ).rejects.toThrow(ContradictoryTimeException);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await expect(service.addClass(999, addClassDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when the subject does not exist', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockSubjectRepository.findOneBy.mockResolvedValue(null);

      await expect(service.addClass(1, addClassDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── removeClass ─────────────────────────────────────────────────────────

  describe('removeClass', () => {
    it('should delete the class and return status 200', async () => {
      mockSubjectClassRepository.findOne.mockResolvedValue(mockSubjectClass);
      mockSubjectClassRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeClass(1, 20);

      expect(result.status).toBe(200);
      expect(mockSubjectClassRepository.delete).toHaveBeenCalledWith(20);
    });

    it('should throw NotFoundException when the class does not exist or does not belong to the user', async () => {
      mockSubjectClassRepository.findOne.mockResolvedValue(null);

      await expect(service.removeClass(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});