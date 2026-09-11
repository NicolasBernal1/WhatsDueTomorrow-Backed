import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarFeed } from './entities/calendar-feed.entity';
import { CalendarService } from './calendar.service';

describe('CalendarService', () => {
  let service: CalendarService;
  let feedRepository: any;
  let userRepository: any;
  let classRepository: any;
  let assignmentRepository: any;

  beforeEach(async () => {
    feedRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOneBy: jest.fn(),
    };
    classRepository = {
      find: jest.fn(),
    };
    assignmentRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: getRepositoryToken(CalendarFeed), useValue: feedRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(SubjectClass), useValue: classRepository },
        { provide: getRepositoryToken(Assignment), useValue: assignmentRepository },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateToken', () => {
    it('should return existing token if feed already exists', async () => {
      feedRepository.findOne.mockResolvedValue({ token: 'existing-token-abc' });

      const token = await service.getOrCreateToken(1);

      expect(token).toBe('existing-token-abc');
      expect(feedRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: 1 } } });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getOrCreateToken(999)).rejects.toThrow(NotFoundException);
    });

    it('should create and return new token if user exists and no feed found', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(mockUser);
      feedRepository.create.mockImplementation((dto) => dto);
      feedRepository.save.mockResolvedValue({ token: 'new-generated-token' });

      const token = await service.getOrCreateToken(1);

      expect(feedRepository.create).toHaveBeenCalled();
      expect(feedRepository.save).toHaveBeenCalled();
      expect(token).toBe('new-generated-token');
    });
  });

  describe('generateForUser', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.generateForUser(999)).rejects.toThrow(NotFoundException);
    });

    it('should generate iCalendar string with classes and assignments', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockClasses = [
        {
          id: 10,
          dayOfWeek: 'Lunes',
          startTime: '08:00',
          endTime: '10:00',
          classroom: 'A-101',
          subject: { name: 'Matemáticas', professor: 'Prof. Gauss' },
        },
      ];
      const mockAssignments = [
        {
          id: 20,
          title: 'Taller 1',
          description: 'Ejercicios 1 a 5',
          dueDate: '2026-09-15T14:00:00.000Z',
          subject: { name: 'Matemáticas' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue(mockClasses);
      assignmentRepository.find.mockResolvedValue(mockAssignments);

      const calendar = await service.generateForUser(1);

      expect(calendar).toContain('BEGIN:VCALENDAR');
      expect(calendar).toContain('END:VCALENDAR');
      expect(calendar).toContain('SUMMARY:Class: Matemáticas');
      expect(calendar).toContain('SUMMARY:Due: Taller 1');
    });
  });

  describe('generateForToken', () => {
    it('should throw NotFoundException if token does not match any feed', async () => {
      feedRepository.findOne.mockResolvedValue(null);

      await expect(service.generateForToken('invalid-token')).rejects.toThrow(NotFoundException);
    });

    it('should call generateForUser with feed user id', async () => {
      const mockFeed = { token: 'valid-token', user: { id: 1 } };
      feedRepository.findOne.mockResolvedValue(mockFeed);
      userRepository.findOneBy.mockResolvedValue({ id: 1 });
      classRepository.find.mockResolvedValue([]);
      assignmentRepository.find.mockResolvedValue([]);

      const calendar = await service.generateForToken('valid-token');

      expect(calendar).toContain('BEGIN:VCALENDAR');
      expect(calendar).toContain('END:VCALENDAR');
    });
  });
});
