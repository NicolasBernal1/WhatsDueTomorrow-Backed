import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarFeed } from './entities/calendar-feed.entity';
import { CalendarService } from './calendar.service';

describe('CalendarService (F23 — Caminos Básicos Backend Tabla 18)', () => {
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

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  // Camino P2: 1-2-3-5-6-9-20
  describe('Camino P2 (1-2-3-5-6-9-20): getOrCreateToken con feed preexistente en BD', () => {
    it('debe reutilizar y retornar el token existente sin consultar usuario ni guardar nuevo registro', async () => {
      feedRepository.findOne.mockResolvedValue({ token: 'existing-token-abc' });

      const token = await service.getOrCreateToken(1);

      expect(token).toBe('existing-token-abc');
      expect(feedRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: 1 } } });
      expect(userRepository.findOneBy).not.toHaveBeenCalled();
      expect(feedRepository.save).not.toHaveBeenCalled();
    });
  });

  // Camino P3: 1-2-3-5-6-7-8-20
  describe('Camino P3 (1-2-3-5-6-7-8-20): getOrCreateToken con usuario huérfano / inexistente', () => {
    it('debe lanzar NotFoundException("User not found") cuando no existe feed previo y el usuario no está en BD', async () => {
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getOrCreateToken(999)).rejects.toThrow(NotFoundException);
      await expect(service.getOrCreateToken(999)).rejects.toThrow('User not found');
      expect(feedRepository.create).not.toHaveBeenCalled();
      expect(feedRepository.save).not.toHaveBeenCalled();
    });
  });

  // Camino P4: 1-2-3-5-6-7-9-20
  describe('Camino P4 (1-2-3-5-6-7-9-20): getOrCreateToken generación inicial de feed', () => {
    it('debe generar un token criptográfico seguro de 64 caracteres hex, guardar el feed y retornar el token', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(mockUser);
      feedRepository.create.mockImplementation((dto) => dto);
      feedRepository.save.mockImplementation(async (feed) => ({ ...feed, id: 10 }));

      const token = await service.getOrCreateToken(1);

      expect(feedRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          token: expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      );
      expect(feedRepository.save).toHaveBeenCalled();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  // Camino P5: 1-2-3-5-10-8-20
  describe('Camino P5 (1-2-3-5-10-8-20): generateForUser con usuario inexistente', () => {
    it('debe lanzar NotFoundException("User not found") antes de consultar clases o entregas', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.generateForUser(999)).rejects.toThrow(NotFoundException);
      await expect(service.generateForUser(999)).rejects.toThrow('User not found');
      expect(classRepository.find).not.toHaveBeenCalled();
      expect(assignmentRepository.find).not.toHaveBeenCalled();
    });
  });

  // Camino P6: 1-2-3-5-10-11-12-13-20
  describe('Camino P6 (1-2-3-5-10-11-12-13-20): generateForUser flujo nominal de generación VCALENDAR', () => {
    it('debe estructurar el calendario RFC 5545 con clases (RRULE semanal) y entregas con escape y plegado', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      const mockClasses = [
        {
          id: 10,
          dayOfWeek: 'lunes',
          startTime: '08:00',
          endTime: '10:00',
          classroom: 'Aula 301',
          subject: { name: 'Matemáticas Especiales; Grupo 1, Sección A', professor: 'Dr. Euler & Gauss' },
        },
      ];
      const mockAssignments = [
        {
          id: 20,
          title: 'Taller de Cálculo Multivariable con descripción sumamente extensa para verificar el algoritmo de plegado a setenta y cinco octetos según estándar RFC',
          description: 'Línea 1\nLínea 2 con caracteres especiales: coma, punto y coma; y barra invertida \\',
          dueDate: '2026-09-15T14:00:00.000Z',
          subject: { name: 'Matemáticas Especiales' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue(mockClasses);
      assignmentRepository.find.mockResolvedValue(mockAssignments);

      const calendar = await service.generateForUser(1);

      // Verificación cabecera y cierre RFC 5545
      expect(calendar).toContain('BEGIN:VCALENDAR');
      expect(calendar).toContain('VERSION:2.0');
      expect(calendar).toContain('PRODID:-//Whats Due Tomorrow//Academic Calendar//EN');
      expect(calendar).toContain('CALSCALE:GREGORIAN');
      expect(calendar).toContain('METHOD:PUBLISH');
      expect(calendar).toContain('END:VCALENDAR');

      // Verificación evento de clase
      expect(calendar).toContain('UID:class-10-user-1@whats-due-tomorrow');
      expect(calendar).toContain('RRULE:FREQ=WEEKLY');
      expect(calendar).toContain('SUMMARY:Class: Matemáticas Especiales\\; Grupo 1\\, Sección A');
      expect(calendar).toContain('DESCRIPTION:Professor: Dr. Euler & Gauss');

      // Verificación evento de entrega
      expect(calendar).toContain('UID:assignment-20-user-1@whats-due-tomorrow');
      expect(calendar).toContain('DTSTART:20260915T140000Z');
      expect(calendar).toContain('Matemáticas Especiales');

      // Verificación plegado RFC 5545 (líneas continuadas con espacio inicial)
      expect(calendar).toMatch(/\r?\n [^\r\n]+/);
    });

    it('debe manejar días de la semana en inglés y por defecto', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      const mockClasses = [
        {
          id: 11,
          dayOfWeek: 'friday',
          startTime: '14:00',
          endTime: '16:00',
          subject: { name: 'Física', professor: 'Newton' },
        },
        {
          id: 12,
          dayOfWeek: 'desconocido',
          startTime: '10:00',
          endTime: '12:00',
          subject: { name: 'Química', professor: 'Mendeleev' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue(mockClasses);
      assignmentRepository.find.mockResolvedValue([]);

      const calendar = await service.generateForUser(1);
      expect(calendar).toContain('UID:class-11-user-1@whats-due-tomorrow');
      expect(calendar).toContain('UID:class-12-user-1@whats-due-tomorrow');
    });
  });

  // Camino P7: 1-2-14-15-16-20
  describe('Camino P7 (1-2-14-15-16-20): generateForToken con token inexistente', () => {
    it('debe lanzar NotFoundException("Calendar feed not found") cuando el token no coincide en BD', async () => {
      feedRepository.findOne.mockResolvedValue(null);

      await expect(service.generateForToken('invalid-non-existent-token')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.generateForToken('invalid-non-existent-token')).rejects.toThrow(
        'Calendar feed not found',
      );
      expect(userRepository.findOneBy).not.toHaveBeenCalled();
    });
  });

  // Camino P8: 1-2-14-15-17-18-19-20
  describe('Camino P8 (1-2-14-15-17-18-19-20): generateForToken flujo nominal con token válido', () => {
    it('debe resolver el feed existente y generar el archivo iCalendar para el usuario correspondiente', async () => {
      const mockFeed = { token: 'valid-token-xyz', user: { id: 5 } };
      feedRepository.findOne.mockResolvedValue(mockFeed);
      userRepository.findOneBy.mockResolvedValue({ id: 5, email: 'user5@example.com' });
      classRepository.find.mockResolvedValue([]);
      assignmentRepository.find.mockResolvedValue([]);

      const calendar = await service.generateForToken('valid-token-xyz');

      expect(feedRepository.findOne).toHaveBeenCalledWith({ where: { token: 'valid-token-xyz' } });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 5 });
      expect(calendar).toContain('BEGIN:VCALENDAR');
      expect(calendar).toContain('END:VCALENDAR');
    });
  });

  // =========================================================================
  // Verificación de Defectos de Calidad RFC 5545 (Auditoría QA)
  // Las siguientes pruebas verifican los defectos identificados en Metricas_Software_F21_F26.docx
  // =========================================================================
  describe('Verificación de Defectos de Calidad RFC 5545 (Auditoría QA)', () => {
    it('[DEF-QA-F23-01] debe incluir DTEND o DURATION en los eventos VEVENT de entregas conforme a RFC 5545 Sección 3.6.1', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      const mockAssignments = [
        {
          id: 50,
          title: 'Entrega de Proyecto Final',
          description: 'Sustentación con rúbrica',
          dueDate: '2026-09-20T23:59:00.000Z',
          subject: { name: 'Validación y Verificación' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue([]);
      assignmentRepository.find.mockResolvedValue(mockAssignments);

      const calendar = await service.generateForUser(1);

      // Conforme a la sección 3.6.1 de RFC 5545:
      // "A 'VEVENT' calendar component with a 'DTSTART' property MUST ALSO specify either
      //  a 'DTEND' or a 'DURATION' property."
      // El método assignmentEvent omite tanto DTEND como DURATION, provocando que aplicaciones
      // como Google Calendar interpreten la entrega como de duración nula (0 minutos) o la descarten.
      expect(calendar).toMatch(/\r?\n(DTEND|DURATION):/);
    });

    it('[DEF-QA-F23-02] debe incluir componente VTIMEZONE para resolver la discrepancia horaria entre tiempo flotante y UTC', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      const mockClasses = [
        {
          id: 1,
          dayOfWeek: 'lunes',
          startTime: '08:00',
          endTime: '10:00',
          subject: { name: 'Arquitectura', professor: 'Prof. Gabriel' },
        },
      ];
      const mockAssignments = [
        {
          id: 2,
          title: 'Parcial 1',
          description: 'En aula',
          dueDate: '2026-09-21T08:00:00.000Z',
          subject: { name: 'Arquitectura' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue(mockClasses);
      assignmentRepository.find.mockResolvedValue(mockAssignments);

      const calendar = await service.generateForUser(1);

      // Defecto QA DEF-QA-F23-02: Las clases se exportan en formato flotante local (sin sufijo Z)
      // mientras que las entregas se exportan en UTC (con sufijo Z). Sin un bloque VTIMEZONE,
      // la aplicación de calendario externa interpreta las entregas en UTC y desplaza la hora
      // por el huso horario local (e.g. UTC-5 en Colombia desplaza la entrega 5 horas).
      expect(calendar).toContain('BEGIN:VTIMEZONE');
    });
  });
});
