import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarFeed } from './entities/calendar-feed.entity';
import { CalendarService } from './calendar.service';
import { Should, fluent } from '../common/fluent-assertions';

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
        {
          provide: getRepositoryToken(SubjectClass),
          useValue: classRepository,
        },
        {
          provide: getRepositoryToken(Assignment),
          useValue: assignmentRepository,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it('debe estar definido el servicio', () => {
    service.Should().BeDefined();
  });

  // Camino P2: 1-2-3-5-6-9-20
  describe('Camino P2 (1-2-3-5-6-9-20): getOrCreateToken con feed preexistente en BD', () => {
    it('debe reutilizar y retornar el token existente sin consultar usuario ni guardar nuevo registro', async () => {
      feedRepository.findOne.mockResolvedValue({ token: 'existing-token-abc' });

      const token = await service.getOrCreateToken(1);

      token.Should().Be('existing-token-abc');
      Should(feedRepository.findOne).HaveBeenCalledWith({
        where: { user: { id: 1 } },
      });
      Should(userRepository.findOneBy).NotHaveBeenCalled();
      Should(feedRepository.save).NotHaveBeenCalled();
    });
  });

  // Camino P3: 1-2-3-5-6-7-8-20
  describe('Camino P3 (1-2-3-5-6-7-8-20): getOrCreateToken con usuario huérfano / inexistente', () => {
    it('debe lanzar NotFoundException("User not found") cuando no existe feed previo y el usuario no está en BD', async () => {
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(null);

      (
        await Should(() => service.getOrCreateToken(999)).ThrowAsync(
          NotFoundException,
        )
      ).WithMessage('User not found');
      Should(feedRepository.create).NotHaveBeenCalled();
      Should(feedRepository.save).NotHaveBeenCalled();
    });
  });

  // Camino P4: 1-2-3-5-6-7-9-20
  describe('Camino P4 (1-2-3-5-6-7-9-20): getOrCreateToken generación inicial de feed', () => {
    it('debe generar un token criptográfico seguro de 64 caracteres hex, guardar el feed y retornar el token', async () => {
      const mockUser = { id: 1, email: 'student@example.com' };
      feedRepository.findOne.mockResolvedValue(null);
      userRepository.findOneBy.mockResolvedValue(mockUser);
      feedRepository.create.mockImplementation((dto) => dto);
      feedRepository.save.mockImplementation(async (feed) => ({
        ...feed,
        id: 10,
      }));

      const token = await service.getOrCreateToken(1);

      Should(feedRepository.create).HaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          token: expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      );
      Should(feedRepository.save).HaveBeenCalled();
      token.Should().Match(/^[0-9a-f]{64}$/);
    });
  });

  // Camino P5: 1-2-3-5-10-8-20
  describe('Camino P5 (1-2-3-5-10-8-20): generateForUser con usuario inexistente', () => {
    it('debe lanzar NotFoundException("User not found") antes de consultar clases o entregas', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      (
        await Should(() => service.generateForUser(999)).ThrowAsync(
          NotFoundException,
        )
      ).WithMessage('User not found');
      Should(classRepository.find).NotHaveBeenCalled();
      Should(assignmentRepository.find).NotHaveBeenCalled();
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
          subject: {
            name: 'Matemáticas Especiales; Grupo 1, Sección A',
            professor: 'Dr. Euler & Gauss',
          },
        },
      ];
      const mockAssignments = [
        {
          id: 20,
          title:
            'Taller de Cálculo Multivariable con descripción sumamente extensa para verificar el algoritmo de plegado a setenta y cinco octetos según estándar RFC',
          description:
            'Línea 1\nLínea 2 con caracteres especiales: coma, punto y coma; y barra invertida \\',
          dueDate: '2026-09-15T14:00:00.000Z',
          subject: { name: 'Matemáticas Especiales' },
        },
      ];

      userRepository.findOneBy.mockResolvedValue(mockUser);
      classRepository.find.mockResolvedValue(mockClasses);
      assignmentRepository.find.mockResolvedValue(mockAssignments);

      const calendar = await service.generateForUser(1);

      // Verificación cabecera y cierre RFC 5545
      calendar.Should().Contain('BEGIN:VCALENDAR');
      calendar.Should().Contain('VERSION:2.0');
      calendar
        .Should()
        .Contain('PRODID:-//Whats Due Tomorrow//Academic Calendar//EN');
      calendar.Should().Contain('CALSCALE:GREGORIAN');
      calendar.Should().Contain('METHOD:PUBLISH');
      calendar.Should().Contain('END:VCALENDAR');

      // Verificación evento de clase
      calendar.Should().Contain('UID:class-10-user-1@whats-due-tomorrow');
      calendar.Should().Contain('RRULE:FREQ=WEEKLY');
      calendar
        .Should()
        .Contain(
          'SUMMARY:Class: Matemáticas Especiales\\; Grupo 1\\, Sección A',
        );
      calendar.Should().Contain('DESCRIPTION:Professor: Dr. Euler & Gauss');

      // Verificación evento de entrega
      calendar.Should().Contain('UID:assignment-20-user-1@whats-due-tomorrow');
      calendar.Should().Contain('DTSTART:20260915T140000Z');
      calendar.Should().Contain('Matemáticas Especiales');

      // Verificación plegado RFC 5545 (líneas continuadas con espacio inicial)
      calendar.Should().Match(/\r?\n [^\r\n]+/);
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
      calendar.Should().Contain('UID:class-11-user-1@whats-due-tomorrow');
      calendar.Should().Contain('UID:class-12-user-1@whats-due-tomorrow');
    });
  });

  // Camino P7: 1-2-14-15-16-20
  describe('Camino P7 (1-2-14-15-16-20): generateForToken con token inexistente', () => {
    it('debe lanzar NotFoundException("Calendar feed not found") cuando el token no coincide en BD', async () => {
      feedRepository.findOne.mockResolvedValue(null);

      (
        await Should(() =>
          service.generateForToken('invalid-non-existent-token'),
        ).ThrowAsync(NotFoundException)
      ).WithMessage('Calendar feed not found');
      Should(userRepository.findOneBy).NotHaveBeenCalled();
    });
  });

  // Camino P8: 1-2-14-15-17-18-19-20
  describe('Camino P8 (1-2-14-15-17-18-19-20): generateForToken flujo nominal con token válido', () => {
    it('debe resolver el feed existente y generar el archivo iCalendar para el usuario correspondiente', async () => {
      const mockFeed = { token: 'valid-token-xyz', user: { id: 5 } };
      feedRepository.findOne.mockResolvedValue(mockFeed);
      userRepository.findOneBy.mockResolvedValue({
        id: 5,
        email: 'user5@example.com',
      });
      classRepository.find.mockResolvedValue([]);
      assignmentRepository.find.mockResolvedValue([]);

      const calendar = await service.generateForToken('valid-token-xyz');

      Should(feedRepository.findOne).HaveBeenCalledWith({
        where: { token: 'valid-token-xyz' },
      });
      Should(userRepository.findOneBy).HaveBeenCalledWith({ id: 5 });
      calendar.Should().Contain('BEGIN:VCALENDAR');
      calendar.Should().Contain('END:VCALENDAR');
    });
  });

  // =========================================================================
  // Verificación de Defectos de Calidad RFC 5545 (Auditoría QA)
  // Las siguientes pruebas verifican los defectos identificados en Metricas_Software_F21_F26.docx
  // =========================================================================
  describe('Verificación de Defectos de Calidad RFC 5545 (Auditoría QA)', () => {
    it('[DEF-QA-F23-01] debe documentar y verificar la omisión de DTEND y DURATION en los eventos VEVENT de entregas (incumplimiento RFC 5545 Sección 3.6.1)', async () => {
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

      // Conforme a la sección 3.6.1 de RFC 5545, un VEVENT debe especificar DTEND o DURATION.
      // Se documenta y verifica el defecto DEF-QA-F23-01: el método assignmentEvent omite ambas propiedades.
      calendar.Should().NotMatch(/\r?\n(DTEND|DURATION):/);
    });

    it('[DEF-QA-F23-02] debe documentar y verificar la ausencia del componente VTIMEZONE para fijar la zona horaria', async () => {
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

      // Se documenta y verifica el defecto DEF-QA-F23-02: Las clases se exportan en formato flotante
      // y las entregas en UTC, pero el archivo carece del bloque VTIMEZONE.
      calendar.Should().NotContain('BEGIN:VTIMEZONE');
    });
  });
});
