import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

describe('CalendarController', () => {
  let controller: CalendarController;
  let calendarService: jest.Mocked<CalendarService>;

  beforeEach(async () => {
    calendarService = {
      getOrCreateToken: jest.fn(),
      generateForUser: jest.fn(),
      generateForToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: calendarService,
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSubscription', () => {
    it('should return 200 and webcalUrl with token and host', async () => {
      const mockReq = {
        user: { sub: 1 },
        get: jest.fn().mockReturnValue('localhost:3000'),
      };
      calendarService.getOrCreateToken.mockResolvedValue('sample-token-123');

      const result = await controller.createSubscription(mockReq);

      expect(calendarService.getOrCreateToken).toHaveBeenCalledWith(1);
      expect(mockReq.get).toHaveBeenCalledWith('host');
      expect(result).toEqual({
        status: 200,
        message: 'Calendar subscription created successfully',
        data: {
          webcalUrl: 'webcal://localhost:3000/calendar/feed/sample-token-123.ics',
        },
      });
    });
  });

  describe('download', () => {
    it('should generate calendar for user and send as attachment', async () => {
      const mockReq = { user: { sub: 1 } };
      const mockRes: any = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      calendarService.generateForUser.mockResolvedValue('BEGIN:VCALENDAR\nEND:VCALENDAR');

      await controller.download(mockReq, mockRes);

      expect(calendarService.generateForUser).toHaveBeenCalledWith(1);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/calendar; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="whats-due-tomorrow.ics"',
      );
      expect(mockRes.send).toHaveBeenCalledWith('BEGIN:VCALENDAR\nEND:VCALENDAR');
    });
  });

  describe('feed', () => {
    it('should call generateForToken with provided token', async () => {
      calendarService.generateForToken.mockResolvedValue('BEGIN:VCALENDAR\nEND:VCALENDAR');

      const result = await controller.feed('sample-token-123');

      expect(calendarService.generateForToken).toHaveBeenCalledWith('sample-token-123');
      expect(result).toBe('BEGIN:VCALENDAR\nEND:VCALENDAR');
    });
  });
});
