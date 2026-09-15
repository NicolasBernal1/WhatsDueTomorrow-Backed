import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RemindersService, getBogotaTomorrowRange } from './reminders.service';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { EmailService } from 'src/email/email.service';

const mockUserA = { id: 1, name: 'Ana', email: 'ana@example.com', password: 'x' };
const mockUserB = { id: 2, name: 'Beto', email: 'beto@example.com', password: 'x' };
const mockSubject = { id: 10, name: 'Math', professor: 'Dr. Smith', color: '#ff0000' };

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 1,
    title: 'Tarea',
    description: '',
    dueDate: '2026-01-02T10:00:00.000Z',
    emailReminderSentAt: null,
    reminderMinutes: null,
    user: mockUserA as any,
    subject: mockSubject as any,
    subtasks: [],
    ...overrides,
  } as Assignment;
}

const mockAssignmentRepository = {
  find: jest.fn(),
  save: jest.fn(),
};

const mockEmailService = {
  send: jest.fn(),
};

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepository },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBogotaTomorrowRange', () => {
    it('should return the UTC boundaries of "tomorrow" in America/Bogota (UTC-5)', () => {
      // 2026-01-01 12:00 UTC = 2026-01-01 07:00 Bogota -> tomorrow is 2026-01-02 Bogota
      const now = new Date('2026-01-01T12:00:00.000Z');

      const { start, end } = getBogotaTomorrowRange(now);

      expect(start).toBe('2026-01-02T05:00:00.000Z'); // 2026-01-02 00:00 Bogota
      expect(end).toBe('2026-01-03T05:00:00.000Z'); // 2026-01-03 00:00 Bogota
    });

    it('should roll over correctly when "now" is already past midnight UTC', () => {
      // 2026-03-10 02:00 UTC = 2026-03-09 21:00 Bogota -> tomorrow is 2026-03-10 Bogota
      const now = new Date('2026-03-10T02:00:00.000Z');

      const { start, end } = getBogotaTomorrowRange(now);

      expect(start).toBe('2026-03-10T05:00:00.000Z');
      expect(end).toBe('2026-03-11T05:00:00.000Z');
    });
  });

  describe('sendDueTomorrowReminders', () => {
    it('should query assignments due tomorrow with no reminder sent yet', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          dueDate: expect.anything(),
          emailReminderSentAt: expect.anything(),
        }),
      });
    });

    it('should return early without sending email when there are no assignments due tomorrow', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.sendDueTomorrowReminders();

      expect(result.status).toBe(200);
      expect(result.message).toBe('No assignments due tomorrow');
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });

    it('should group assignments by user and send one email per user', async () => {
      const assignmentA1 = makeAssignment({ id: 1, user: mockUserA as any });
      const assignmentA2 = makeAssignment({ id: 2, user: mockUserA as any, title: 'Tarea 2' });
      const assignmentB1 = makeAssignment({ id: 3, user: mockUserB as any });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA1, assignmentA2, assignmentB1]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockEmailService.send).toHaveBeenCalledTimes(2);
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'ana@example.com' }),
      );
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'beto@example.com' }),
      );
    });

    it('should include every assignment title in the email body for a user with multiple assignments', async () => {
      const assignmentA1 = makeAssignment({ id: 1, user: mockUserA as any, title: 'Tarea Uno' });
      const assignmentA2 = makeAssignment({ id: 2, user: mockUserA as any, title: 'Tarea Dos' });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA1, assignmentA2]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      const call = mockEmailService.send.mock.calls[0][0];
      expect(call.html).toContain('Tarea Uno');
      expect(call.html).toContain('Tarea Dos');
      expect(call.text).toContain('Tarea Uno');
      expect(call.text).toContain('Tarea Dos');
    });

    it('should format the due date naturally in Spanish, not as a raw JS Date string', async () => {
      // 2026-09-16T04:59:00.000Z = 2026-09-15 23:59 in America/Bogota
      const assignment = makeAssignment({ dueDate: '2026-09-16T04:59:00.000Z' });
      mockAssignmentRepository.find.mockResolvedValue([assignment]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      const call = mockEmailService.send.mock.calls[0][0];
      expect(call.html).toContain('martes, 15 de septiembre, 11:59 p. m.');
      expect(call.text).toContain('martes, 15 de septiembre, 11:59 p. m.');
      expect(call.html).not.toContain('GMT');
      expect(call.html).not.toContain('Tue Sep');
    });

    it('should mark emailReminderSentAt on assignments after a successful send', async () => {
      const assignment = makeAssignment({ id: 1 });
      mockAssignmentRepository.find.mockResolvedValue([assignment]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([assignment]);

      await service.sendDueTomorrowReminders();

      expect(mockAssignmentRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, emailReminderSentAt: expect.any(Date) }),
      ]);
    });

    it('should NOT mark emailReminderSentAt for a user whose send failed, and should still process other users', async () => {
      const assignmentA = makeAssignment({ id: 1, user: mockUserA as any });
      const assignmentB = makeAssignment({ id: 2, user: mockUserB as any });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA, assignmentB]);
      mockEmailService.send
        .mockRejectedValueOnce(new Error('Resend API error (500): boom'))
        .mockResolvedValueOnce(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockEmailService.send).toHaveBeenCalledTimes(2);
      expect(mockAssignmentRepository.save).toHaveBeenCalledTimes(1);
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ id: 2, emailReminderSentAt: expect.any(Date) }),
      ]);
    });
  });
});
