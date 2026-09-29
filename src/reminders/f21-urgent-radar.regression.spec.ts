import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Between, IsNull } from 'typeorm';
import { RemindersService, getBogotaTomorrowRange } from './reminders.service';
import { AssignmentsService } from 'src/assignments/assignments.service';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { EmailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { Should } from '../common/fluent-assertions';

/**
 * ============================================================================
 * SUITE DE PRUEBAS DE REGRESIÓN — F21: ALERTAS Y RADAR DE ENTREGAS URGENTES
 * ============================================================================
 * Objetivo de Regresión:
 * Garantizar que modificaciones en cálculo de fechas, lógica de plantillas de
 * correo, manejo de errores en lote o consultas de TypeORM no degraden ni
 * alteren el comportamiento crítico de alertas y radar de entregas urgentes.
 */
describe('F21 Regression Suite: Alertas y Radar de Entregas Urgentes (Backend)', () => {
  let remindersService: RemindersService;
  let assignmentsService: AssignmentsService;

  const mockAssignmentRepo = {
    find: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailService = {
    send: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockSubjectsService = {
    getSubjectById: jest.fn(),
  };

  const userAlice = { id: 1, name: 'Alice', email: 'alice@uni.edu' };
  const userBob = { id: 2, name: 'Bob', email: 'bob@uni.edu' };
  const userCharlie = { id: 3, name: 'Charlie', email: 'charlie@uni.edu' };

  const subjectSoftware = { id: 10, name: 'Ingeniería de Software' };
  const subjectAlgorithms = { id: 20, name: 'Algoritmos y Estructuras' };

  function buildAssignment(overrides: Partial<Assignment> = {}): Assignment {
    return {
      id: 101,
      title: 'Taller de Pruebas',
      description: 'Informe detallado de cobertura',
      dueDate: '2026-06-15T15:00:00.000Z',
      emailReminderSentAt: null,
      reminderMinutes: 60,
      user: userAlice as any,
      subject: subjectSoftware as any,
      subtasks: [],
      ...overrides,
    } as Assignment;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        AssignmentsService,
        {
          provide: getRepositoryToken(Assignment),
          useValue: mockAssignmentRepo,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SubjectsService, useValue: mockSubjectsService },
      ],
    }).compile();

    remindersService = module.get<RemindersService>(RemindersService);
    assignmentsService = module.get<AssignmentsService>(AssignmentsService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 1: Estabilidad Temporal y Aritmética de Fechas (America/Bogota)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 1: Cálculo de Ventana Temporal (America/Bogota UTC-5)', () => {
    it('debe mantener exactamente un intervalo de 24 horas (86,400,000 ms) entre start y end', () => {
      const datesToTest = [
        new Date('2026-01-01T00:00:00.000Z'),
        new Date('2026-06-15T18:30:00.000Z'),
        new Date('2028-02-28T23:59:59.000Z'), // Año bisiesto
        new Date('2026-12-31T04:59:59.000Z'), // Antes de medianoche UTC
      ];

      for (const testDate of datesToTest) {
        const { start, end } = getBogotaTomorrowRange(testDate);
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const diffMs = endTime - startTime;

        diffMs.Should().Be(24 * 60 * 60 * 1000);
        new Date(start).getUTCHours().Should().Be(5);
        new Date(end).getUTCHours().Should().Be(5);
      }
    });

    it('debe calcular correctamente la ventana en transición de año bisiesto (28 feb -> 29 feb)', () => {
      // 2028-02-28 a las 20:00 UTC = 2028-02-28 a las 15:00 en Bogotá -> Mañana es 2028-02-29
      const leapYearEve = new Date('2028-02-28T20:00:00.000Z');
      const { start, end } = getBogotaTomorrowRange(leapYearEve);

      start.Should().Be('2028-02-29T05:00:00.000Z');
      end.Should().Be('2028-03-01T05:00:00.000Z');
    });

    it('debe calcular correctamente la ventana en cambio de año calendario (31 dic -> 01 ene)', () => {
      // 2026-12-31 a las 22:00 UTC = 2026-12-31 a las 17:00 Bogotá -> Mañana es 2027-01-01
      const yearEnd = new Date('2026-12-31T22:00:00.000Z');
      const { start, end } = getBogotaTomorrowRange(yearEnd);

      start.Should().Be('2027-01-01T05:00:00.000Z');
      end.Should().Be('2027-01-02T05:00:00.000Z');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 2: Seguridad y Sanitización contra XSS en Plantillas de Correo
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 2: Sanitización de Contenido y Prevención XSS', () => {
    it('debe escapar caracteres HTML maliciosos (<, >, &) en títulos y materias sin romper texto legítimo', async () => {
      const maliciousAssignment = buildAssignment({
        id: 777,
        title: '<script>alert("XSS")</script> & <b>Importante</b>',
        subject: { id: 99, name: 'Seguridad & Redes <Avanzado>' } as any,
        user: userAlice as any,
      });

      mockAssignmentRepo.find.mockResolvedValue([maliciousAssignment]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepo.save.mockResolvedValue([]);

      await remindersService.sendDueTomorrowReminders();

      Should(mockEmailService.send).HaveBeenCalledTimes(1);
      const callArgs = mockEmailService.send.mock.calls[0][0];

      // Verificación de escape seguro en HTML
      callArgs.html.Should().NotContain('<script>');
      callArgs.html.Should().Contain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
      callArgs.html.Should().Contain('&amp;');
      callArgs.html.Should().Contain('Seguridad &amp; Redes &lt;Avanzado&gt;');

      // Verificación de formato en texto plano (conserva legibilidad sin HTML)
      callArgs.text.Should().Contain('<script>alert("XSS")</script>');
      callArgs.text.Should().Contain('Seguridad & Redes <Avanzado>');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 3: Aislamiento de Errores en Procesamiento por Lote (Resiliencia)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 3: Resiliencia y Aislamiento en Lote de Notificaciones', () => {
    it('no debe abortar el lote si un usuario falla; los demás deben recibir su alerta y quedar marcados', async () => {
      const assignmentAlice = buildAssignment({ id: 1, user: userAlice as any });
      const assignmentBob = buildAssignment({ id: 2, user: userBob as any });
      const assignmentCharlie = buildAssignment({ id: 3, user: userCharlie as any });

      mockAssignmentRepo.find.mockResolvedValue([
        assignmentAlice,
        assignmentBob,
        assignmentCharlie,
      ]);

      // Bob falla con error de red/servidor, Alice y Charlie tienen éxito
      mockEmailService.send
        .mockResolvedValueOnce(undefined) // Alice OK
        .mockRejectedValueOnce(new Error('SMTP Gateway Timeout 504')) // Bob ERROR
        .mockResolvedValueOnce(undefined); // Charlie OK

      mockAssignmentRepo.save.mockResolvedValue([]);

      const result = await remindersService.sendDueTomorrowReminders();

      // Debe responder con éxito general sin lanzar excepción no controlada
      result.status.Should().Be(200);
      result.message.Should().Be('Due-tomorrow reminders processed');

      // Se intentó enviar a los 3 usuarios
      Should(mockEmailService.send).HaveBeenCalledTimes(3);

      // Solo los usuarios exitosos (Alice y Charlie) se persisten en base de datos
      Should(mockAssignmentRepo.save).HaveBeenCalledTimes(2);

      // Bob NO fue marcado como enviado (queda pendiente para reintento)
      Should(assignmentBob.emailReminderSentAt).BeNull();

      // Alice y Charlie sí fueron actualizados con marca de tiempo
      Should(assignmentAlice.emailReminderSentAt).NotBeNull();
      Should(assignmentCharlie.emailReminderSentAt).NotBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 4: Idempotencia y Criterio de Consulta Anti-Spam
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 4: Idempotencia y Criterio IsNull en Recordatorios', () => {
    it('debe filtrar estrictamente por emailReminderSentAt: IsNull() para evitar duplicados', async () => {
      mockAssignmentRepo.find.mockResolvedValue([]);

      await remindersService.sendDueTomorrowReminders();

      Should(mockAssignmentRepo.find).HaveBeenCalledWith({
        where: {
          dueDate: expect.any(Object),
          emailReminderSentAt: IsNull(),
        },
      });
      Should(mockEmailService.send).NotHaveBeenCalled();
    });

    it('debe retornar mensaje temprano y omitir envíos si no hay tareas pendientes para mañana', async () => {
      mockAssignmentRepo.find.mockResolvedValue([]);

      const res = await remindersService.sendDueTomorrowReminders();

      res.status.Should().Be(200);
      res.message.Should().Be('No assignments due tomorrow');
      Should(mockEmailService.send).NotHaveBeenCalled();
      Should(mockAssignmentRepo.save).NotHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 5: Contrato del Radar de Entregas Próximas (AssignmentsService)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 5: Contrato de Radar de Entregas Próximas (getUpcomingAssignments)', () => {
    it('debe aplicar ventana Between(now, limit) y ordenar cronológicamente ASC por dueDate', async () => {
      const mockUpcoming = [
        buildAssignment({
          id: 201,
          title: 'Entrega 1 (En 2h)',
          dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          subject: subjectSoftware as any,
        }),
        buildAssignment({
          id: 202,
          title: 'Entrega 2 (En 24h)',
          dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          subject: subjectAlgorithms as any,
        }),
      ];

      mockAssignmentRepo.find.mockResolvedValue(mockUpcoming);

      const result = await assignmentsService.getUpcomingAssignments(userAlice.id, 48);

      Should(mockAssignmentRepo.find).HaveBeenCalledWith({
        where: {
          user: { id: userAlice.id },
          dueDate: expect.any(Object),
        },
        order: { dueDate: 'ASC' },
      });

      result.status.Should().Be(200);
      result.message.Should().Be('Upcoming assignments retrieved successfully');
      result.data!.Should().HaveCount(2);
      result.data![0].title.Should().Be('Entrega 1 (En 2h)');
      result.data![0].subjectName.Should().Be('Ingeniería de Software');
      result.data![1].title.Should().Be('Entrega 2 (En 24h)');
      result.data![1].subjectName.Should().Be('Algoritmos y Estructuras');
    });

    it('debe convertir descripciones null/undefined en string vacío "" para proteger el contrato DTO', async () => {
      const assignmentWithNullDesc = buildAssignment({
        id: 301,
        title: 'Tarea sin descripción',
        description: null as any,
        subject: subjectSoftware as any,
      });

      mockAssignmentRepo.find.mockResolvedValue([assignmentWithNullDesc]);

      const result = await assignmentsService.getUpcomingAssignments(userAlice.id);

      result.data![0].description.Should().Be('');
    });

    it('debe retornar lista vacía con mensaje "No upcoming assignments" cuando no hay entregas en ventana', async () => {
      mockAssignmentRepo.find.mockResolvedValue([]);

      const result = await assignmentsService.getUpcomingAssignments(userBob.id);

      result.status.Should().Be(200);
      result.message.Should().Be('No upcoming assignments');
      result.data!.Should().BeEmpty();
    });
  });
});
