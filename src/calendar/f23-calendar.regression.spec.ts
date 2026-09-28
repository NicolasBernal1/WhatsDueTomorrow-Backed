import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarFeed } from './entities/calendar-feed.entity';
import { CalendarService } from './calendar.service';
import { Should } from '../common/fluent-assertions';

/**
 * ============================================================================
 * SUITE DE PRUEBAS DE REGRESIÓN — F23: SINCRONIZACIÓN Y EXPORTACIÓN .ICS
 * ============================================================================
 * Objetivo de Regresión:
 * Garantizar que modificaciones en generadores de fechas, escape de cadenas,
 * normalización de tokens o consultas de TypeORM preserven la estricta
 * conformidad con RFC 5545 (iCalendar), previniendo eventos desfasados,
 * errores de sintaxis en clientes externos (Apple, Google, Outlook) o
 * pérdida de tokens de suscripción webcal.
 */
describe('F23 Regression Suite: Sincronización y exportación de calendario .ics (Backend)', () => {
  let service: CalendarService;

  const mockUser: User = {
    id: 7,
    name: 'Estudiante Calendario',
    email: 'estudiante@universidad.edu',
  } as User;

  const mockSubject = {
    id: 1,
    name: 'Verificación & Validación, Pruebas; Lab',
    professor: 'Dr. Gabriel \\ Docente',
  };

  const mockClass: SubjectClass = {
    id: 101,
    dayOfWeek: 'lunes',
    startTime: '08:00:00',
    endTime: '10:00:00',
    subject: mockSubject as any,
    user: mockUser,
  } as SubjectClass;

  const mockAssignment: Assignment = {
    id: 201,
    title: 'Entrega Final: Taller de Regresión, Pruebas; & CI/CD',
    description: 'Línea 1 con salto\nLínea 2 con punto y coma; y comas, además de barras \\',
    dueDate: '2026-10-15T14:30:00.000Z',
    subject: mockSubject as any,
    user: mockUser,
  } as Assignment;

  const mockFeedRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  const mockClassRepo = {
    find: jest.fn(),
  };

  const mockAssignmentRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: getRepositoryToken(CalendarFeed), useValue: mockFeedRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(SubjectClass), useValue: mockClassRepo },
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepo },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 1: Conformidad RFC 5545, Terminadores CRLF y Plegado de Líneas
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 1: Conformidad Estricta con RFC 5545 (iCalendar)', () => {
    it('debe utilizar exclusivamente terminadores CRLF (\\r\\n) y estructura VCALENDAR válida', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([]);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const ics = await service.generateForUser(mockUser.id);

      // Verificación de encabezados y finalizadores estándar RFC 5545
      ics.Should().StartWith('BEGIN:VCALENDAR\r\n');
      ics.Should().EndWith('END:VCALENDAR\r\n');
      ics.Should().Contain('VERSION:2.0\r\n');
      ics.Should().Contain('PRODID:-//Whats Due Tomorrow//Academic Calendar//EN\r\n');
      ics.Should().Contain('CALSCALE:GREGORIAN\r\n');
      ics.Should().Contain('METHOD:PUBLISH\r\n');

      // No debe contener saltos LF huérfanos sin CR (\r\n exclusivamente)
      const nonCrlf = ics.replace(/\r\n/g, '').includes('\n');
      nonCrlf.Should().BeFalse();
    });

    it('debe plegar (line folding) cualquier línea que supere los 75 octetos anteponiendo un espacio', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([]);

      const longAssignment = {
        ...mockAssignment,
        title: 'Título extremadamente largo que sobrepasa con creces el límite estándar de setenta y cinco caracteres impuesto por la especificación RFC 5545 para clientes de calendario',
      };
      mockAssignmentRepo.find.mockResolvedValue([longAssignment]);

      const ics = await service.generateForUser(mockUser.id);

      // Debe haber dividido la línea larga con \r\n seguido de un espacio
      ics.Should().Contain('\r\n ');

      // Ninguna línea individual debe tener más de 75 octetos (excluyendo el \r\n)
      const lines = ics.split('\r\n');
      for (const line of lines) {
        (line.length <= 75).Should().BeTrue();
      }
    });

    it('debe escapar comas, puntos y comas, barras invertidas y saltos de línea en texto', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([mockClass]);
      mockAssignmentRepo.find.mockResolvedValue([mockAssignment]);

      const ics = await service.generateForUser(mockUser.id);

      // Caracteres especiales escapados con backslash según RFC 5545
      ics.Should().Contain(String.raw`\,`);
      ics.Should().Contain(String.raw`\;`);
      ics.Should().Contain(String.raw`\\`);
      ics.Should().Contain(String.raw`\n`);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 2: Formatos de Fechas (Horarios Flotantes vs UTC) y RRULE
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 2: Formato de Fechas y Reglas de Recurrencia', () => {
    it('debe generar clases con RRULE:FREQ=WEEKLY y horas flotantes (sin "Z")', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([mockClass]);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const ics = await service.generateForUser(mockUser.id);

      ics.Should().Contain('BEGIN:VEVENT');
      ics.Should().Contain(`UID:class-101-user-7@whats-due-tomorrow`);
      ics.Should().Contain('RRULE:FREQ=WEEKLY');

      // DTSTART y DTEND de clase no deben terminar en Z (tiempo flotante)
      ics.Should().Match(/DTSTART:\d{8}T080000(?!\w)/);
      ics.Should().Match(/DTEND:\d{8}T100000(?!\w)/);
    });

    it('debe generar entregas en formato absoluto UTC terminado en "Z"', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([]);
      mockAssignmentRepo.find.mockResolvedValue([mockAssignment]);

      const ics = await service.generateForUser(mockUser.id);

      ics.Should().Contain('BEGIN:VEVENT');
      ics.Should().Contain(`UID:assignment-201-user-7@whats-due-tomorrow`);
      ics.Should().Contain('DTSTART:20261015T143000Z');
      ics.Should().Match(/DTSTAMP:\d{8}T\d{6}Z/);
    });

    it('debe mapear correctamente los nombres de días de la semana en español e inglés', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      const spanishClass = { ...mockClass, id: 102, dayOfWeek: 'miércoles' };
      const englishClass = { ...mockClass, id: 103, dayOfWeek: 'friday' };
      mockClassRepo.find.mockResolvedValue([spanishClass, englishClass]);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const ics = await service.generateForUser(mockUser.id);

      ics.Should().Contain('UID:class-102-user-7@whats-due-tomorrow');
      ics.Should().Contain('UID:class-103-user-7@whats-due-tomorrow');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 3: Idempotencia y Criptografía en Tokens de Suscripción
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 3: Idempotencia y Criptografía de Tokens de Feed', () => {
    it('debe reutilizar el token existente del usuario sin sobreescribirlo ni regenerarlo', async () => {
      const existingToken = 'a'.repeat(64);
      mockFeedRepo.findOne.mockResolvedValue({ token: existingToken });

      const token = await service.getOrCreateToken(mockUser.id);

      token.Should().Be(existingToken);
      Should(mockFeedRepo.save).NotHaveBeenCalled();
      Should(mockUserRepo.findOneBy).NotHaveBeenCalled();
    });

    it('debe generar un token criptográfico de exactamente 64 caracteres hex al crear nueva suscripción', async () => {
      mockFeedRepo.findOne.mockResolvedValue(null);
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockFeedRepo.create.mockImplementation((dto) => dto);
      mockFeedRepo.save.mockImplementation(async (entity) => entity);

      const token = await service.getOrCreateToken(mockUser.id);

      token.length.Should().Be(64);
      token.Should().Match(/^[a-f0-9]{64}$/);
      Should(mockFeedRepo.save).HaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario solicitado no existe al crear token o generar feed', async () => {
      mockFeedRepo.findOne.mockResolvedValue(null);
      mockUserRepo.findOneBy.mockResolvedValue(null);

      await Should(async () => service.getOrCreateToken(999)).ThrowAsync(
        'User not found',
      );
      await Should(async () => service.generateForUser(999)).ThrowAsync(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 4: Sincronización Pública mediante Token Webcal
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 4: Resolución Pública de Feed por Token (generateForToken)', () => {
    it('debe resolver el calendario del usuario propietario asociado al token de feed', async () => {
      const feedToken = 'b'.repeat(64);
      mockFeedRepo.findOne.mockResolvedValue({
        token: feedToken,
        user: mockUser,
      });
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockClassRepo.find.mockResolvedValue([]);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const ics = await service.generateForToken(feedToken);

      ics.Should().Contain('BEGIN:VCALENDAR');
      Should(mockFeedRepo.findOne).HaveBeenCalledWith({
        where: { token: feedToken },
      });
    });

    it('debe lanzar NotFoundException si el token de feed no existe en la base de datos', async () => {
      mockFeedRepo.findOne.mockResolvedValue(null);

      await Should(async () =>
        service.generateForToken('token-inexistente-123'),
      ).ThrowAsync('Calendar feed not found');
    });
  });
});
