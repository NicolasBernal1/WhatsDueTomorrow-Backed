import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

describe('CalendarController (F23 — Caminos Básicos Backend Tabla 18)', () => {
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

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  // Camino P1: 1-2-3-4-20
  describe('Camino P1 (1-2-3-4-20): Verificación de guardias de seguridad JWT', () => {
    it('debe exigir guardia JwtAuthGuard (@UseGuards(AuthGuard("jwt"))) en /subscription y /download, y permitir acceso público en feed', () => {
      const guardsSub = Reflect.getMetadata('__guards__', CalendarController.prototype.createSubscription);
      const guardsDl = Reflect.getMetadata('__guards__', CalendarController.prototype.download);
      const guardsFeed = Reflect.getMetadata('__guards__', CalendarController.prototype.feed);

      expect(guardsSub).toBeDefined();
      expect(guardsSub.length).toBeGreaterThan(0);
      expect(guardsDl).toBeDefined();
      expect(guardsDl.length).toBeGreaterThan(0);
      expect(guardsFeed).toBeUndefined();
    });
  });

  // Camino P2: 1-2-3-5-6-9-20
  describe('Camino P2 (1-2-3-5-6-9-20): POST /subscription con feed preexistente', () => {
    it('debe reutilizar el token existente del usuario y retornar HTTP 200 con la URL webcal://', async () => {
      const mockReq = {
        user: { sub: 1 },
        get: jest.fn().mockReturnValue('localhost:3000'),
      };
      calendarService.getOrCreateToken.mockResolvedValue('existing-feed-token-123');

      const result = await controller.createSubscription(mockReq);

      expect(calendarService.getOrCreateToken).toHaveBeenCalledWith(1);
      expect(mockReq.get).toHaveBeenCalledWith('host');
      expect(result).toEqual({
        status: 200,
        message: 'Calendar subscription created successfully',
        data: {
          webcalUrl: 'webcal://localhost:3000/calendar/feed/existing-feed-token-123.ics',
        },
      });
    });
  });

  // Camino P4: 1-2-3-5-6-7-9-20
  describe('Camino P4 (1-2-3-5-6-7-9-20): POST /subscription con generación inicial de feed', () => {
    it('debe generar un nuevo token y retornar HTTP 200 con webcalUrl', async () => {
      const mockReq = {
        user: { sub: 2 },
        get: jest.fn().mockReturnValue('api.whatsdue.app'),
      };
      calendarService.getOrCreateToken.mockResolvedValue('newly-generated-hex-token-456');

      const result = await controller.createSubscription(mockReq);

      expect(calendarService.getOrCreateToken).toHaveBeenCalledWith(2);
      expect(mockReq.get).toHaveBeenCalledWith('host');
      expect(result.status).toBe(200);
      expect(result.data.webcalUrl).toBe('webcal://api.whatsdue.app/calendar/feed/newly-generated-hex-token-456.ics');
    });
  });

  // Camino P6: 1-2-3-5-10-11-12-13-20
  describe('Camino P6 (1-2-3-5-10-11-12-13-20): GET /download flujo nominal de descarga', () => {
    it('debe generar el calendario para el usuario autenticado y configurar headers attachment de descarga', async () => {
      const mockReq = { user: { sub: 1 } };
      const mockRes: any = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      const mockCalendarContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n';
      calendarService.generateForUser.mockResolvedValue(mockCalendarContent);

      await controller.download(mockReq, mockRes);

      expect(calendarService.generateForUser).toHaveBeenCalledWith(1);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/calendar; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="whats-due-tomorrow.ics"',
      );
      expect(mockRes.send).toHaveBeenCalledWith(mockCalendarContent);
    });
  });

  // Camino P8: 1-2-14-15-17-18-19-20
  describe('Camino P8 (1-2-14-15-17-18-19-20): GET /feed/:token.ics sincronización pública webcal', () => {
    it('debe retornar el texto plano iCalendar asociado al token público proporcionado', async () => {
      const token = 'public-feed-token-789';
      const mockIcs = 'BEGIN:VCALENDAR\r\nPRODID:-//Whats Due Tomorrow//Academic Calendar//EN\r\nEND:VCALENDAR\r\n';
      calendarService.generateForToken.mockResolvedValue(mockIcs);

      const result = await controller.feed(token);

      expect(calendarService.generateForToken).toHaveBeenCalledWith(token);
      expect(result).toBe(mockIcs);
    });
  });
});
