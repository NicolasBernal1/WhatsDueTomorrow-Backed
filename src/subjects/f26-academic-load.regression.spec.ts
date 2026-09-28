import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  SubjectsService,
  MIN_BALANCED_CREDITS,
  MAX_BALANCED_CREDITS,
  AUTONOMOUS_HOURS_MULTIPLIER,
} from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { Should } from 'src/common/fluent-assertions';

describe('F26 Regression Test Suite - Gestión de créditos y semáforo de carga semanal (Backend)', () => {
  let service: SubjectsService;
  let subjectRepository: any;
  let subjectClassRepository: any;
  let userService: any;

  const mockUser = {
    id: 42,
    name: 'Estudiante Regresion',
    email: 'estudiante.regresion@universidad.edu.co',
  } as any;

  beforeEach(async () => {
    subjectRepository = {
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      preload: jest.fn(),
    };

    subjectClassRepository = {
      findBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      preload: jest.fn(),
    };

    userService = {
      findOneById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: subjectRepository,
        },
        {
          provide: getRepositoryToken(SubjectClass),
          useValue: subjectClassRepository,
        },
        {
          provide: UsersService,
          useValue: userService,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Regresión de Seguridad y Autenticación (Controller & Guards)', () => {
    it('REG-F26-01: debe verificar que SubjectsController está protegido globalmente con AuthGuard("jwt")', () => {
      const guards = Reflect.getMetadata('__guards__', SubjectsController);
      Should(guards).NotBeNull();
      Should(guards.length).BeGreaterThan(0);
      const guardInstance = new guards[0]();
      Should(guardInstance).BeInstanceOf(AuthGuard('jwt'));
    });

    it('REG-F26-02: debe lanzar NotFoundException si el usuario autenticado no existe en la base de datos', async () => {
      userService.findOneById.mockResolvedValue(null);

      await (
        await Should(() => service.getAcademicLoadSummary(999))
      ).ThrowAsync(new NotFoundException('User not found'));

      Should(subjectRepository.findBy).NotHaveBeenCalled();
      Should(subjectClassRepository.findBy).NotHaveBeenCalled();
    });
  });

  describe('Regresión de Semáforo de Carga y Límites de Créditos (Unit & Business Rules)', () => {
    it('REG-F26-03: debe clasificar la carga como "baja" cuando los créditos son menores a 12 (ej. 8 créditos)', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Fundamentos de Programación', credits: 4 },
        { id: 2, name: 'Álgebra Lineal', credits: 4 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.status).Be(200);
      Should(response.data.totalCredits).Be(8);
      Should(response.data.status).Be('baja');
      Should(response.data.statusLabel).Be('Carga baja');
      Should(response.data.subjectsCount).Be(2);
    });

    it('REG-F26-04: debe clasificar la carga como "balanceada" en los valores frontera exactos de 12 y 18 créditos', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectClassRepository.findBy.mockResolvedValue([]);

      // Límite inferior exacto: 12 créditos
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Asignatura A', credits: 6 },
        { id: 2, name: 'Asignatura B', credits: 6 },
      ]);
      const resMin = await service.getAcademicLoadSummary(mockUser.id);
      Should(resMin.data.totalCredits).Be(MIN_BALANCED_CREDITS);
      Should(resMin.data.status).Be('balanceada');
      Should(resMin.data.statusLabel).Be('Carga balanceada');

      // Límite superior exacto: 18 créditos
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Asignatura A', credits: 6 },
        { id: 2, name: 'Asignatura B', credits: 6 },
        { id: 3, name: 'Asignatura C', credits: 6 },
      ]);
      const resMax = await service.getAcademicLoadSummary(mockUser.id);
      Should(resMax.data.totalCredits).Be(MAX_BALANCED_CREDITS);
      Should(resMax.data.status).Be('balanceada');
      Should(resMax.data.statusLabel).Be('Carga balanceada');
    });

    it('REG-F26-05: debe clasificar la carga como "sobrecarga" cuando los créditos superan 18 (ej. 20 créditos)', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Cálculo Avanzado', credits: 5 },
        { id: 2, name: 'Física II', credits: 5 },
        { id: 3, name: 'Bases de Datos', credits: 5 },
        { id: 4, name: 'Ingeniería de Software', credits: 5 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.status).Be(200);
      Should(response.data.totalCredits).Be(20);
      Should(response.data.status).Be('sobrecarga');
      Should(response.data.statusLabel).Be('Sobrecarga');
      Should(response.data.subjectsCount).Be(4);
    });

    it('REG-F26-06: debe retornar 0 créditos y carga "baja" cuando el usuario no tiene asignaturas inscritas', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.status).Be(200);
      Should(response.data.totalCredits).Be(0);
      Should(response.data.status).Be('baja');
      Should(response.data.statusLabel).Be('Carga baja');
      Should(response.data.subjectsCount).Be(0);
      Should(response.data.classesCount).Be(0);
      Should(response.data.weeklyPresentialHours).Be(0);
      Should(response.data.weeklyAutonomousHours).Be(0);
    });

    it('REG-F26-07: debe asignar el valor por defecto de 3 créditos si una asignatura tiene credits null o undefined', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Asignatura Sin Créditos Definidos', credits: null },
        { id: 2, name: 'Asignatura Con Créditos Indefinidos', credits: undefined },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.data.totalCredits).Be(6); // 3 + 3
      Should(response.data.status).Be('baja');
    });
  });

  describe('Regresión de Cálculo de Horas Presenciales y Autónomas (Weekly Hours)', () => {
    it('REG-F26-08: debe calcular con precisión las horas presenciales y duplicarlas para el estudio autónomo (2:1)', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Materia 1', credits: 4 },
      ]);
      // Clase 1: 08:00 a 10:00 (120 minutos = 2.0 horas)
      // Clase 2: 14:00 a 15:30 (90 minutos = 1.5 horas)
      // Total presencial: 210 minutos = 3.5 horas. Autónomo: 3.5 * 2 = 7.0 horas.
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
        { id: 2, dayOfWeek: 'wednesday', startTime: '14:00', endTime: '15:30' },
      ]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.data.weeklyPresentialHours).Be(3.5);
      Should(response.data.weeklyAutonomousHours).Be(7.0);
      Should(response.data.classesCount).Be(2);
    });

    it('REG-F26-09: debe redondear adecuadamente a dos decimales cuando las horas resultan con fracciones no exactas', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Materia Corta', credits: 3 },
      ]);
      // Clase: 08:10 a 09:25 (75 minutos = 1.25 horas). Autónomo: 1.25 * 2 = 2.5 horas
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'friday', startTime: '08:10', endTime: '09:25' },
      ]);

      const response = await service.getAcademicLoadSummary(mockUser.id);

      Should(response.data.weeklyPresentialHours).Be(1.25);
      Should(response.data.weeklyAutonomousHours).Be(2.5);
    });
  });

  describe('Regresión de Validación y Restricciones de Dominio (DTOs & Exceptions)', () => {
    it('REG-F26-10: debe rechazar adición de asignatura con créditos inválidos (< 1, > 12 o no enteros)', async () => {
      userService.findOneById.mockResolvedValue(mockUser);

      // Créditos menores a 1 (0)
      await (
        await Should(() =>
          service.addSubject(mockUser.id, {
            name: 'Materia Inválida',
            professor: 'Profesor X',
            credits: 0,
          }),
        )
      ).ThrowAsync(
        new BadRequestException('The credits must be an integer between 1 and 12'),
      );

      // Créditos mayores a 12 (13)
      await (
        await Should(() =>
          service.addSubject(mockUser.id, {
            name: 'Materia Inválida',
            professor: 'Profesor X',
            credits: 13,
          }),
        )
      ).ThrowAsync(
        new BadRequestException('The credits must be an integer between 1 and 12'),
      );

      // Créditos decimales (4.5)
      await (
        await Should(() =>
          service.addSubject(mockUser.id, {
            name: 'Materia Decimal',
            professor: 'Profesor X',
            credits: 4.5 as any,
          }),
        )
      ).ThrowAsync(
        new BadRequestException('The credits must be an integer between 1 and 12'),
      );
    });

    it('REG-F26-11: debe crear exitosamente una asignatura con créditos válidos en los límites 1 y 12', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      const mockCreatedSubject = {
        id: 101,
        name: 'Laboratorio de Software',
        professor: 'Ing. Tutor',
        color: '#107c41',
        credits: 12,
        user: mockUser,
      };
      subjectRepository.create.mockReturnValue(mockCreatedSubject);
      subjectRepository.save.mockResolvedValue(mockCreatedSubject);

      const response = await service.addSubject(mockUser.id, {
        name: 'Laboratorio de Software',
        professor: 'Ing. Tutor',
        color: '#107c41',
        credits: 12,
      });

      Should(response.status).Be(201);
      Should(response.message).Be('Subject created successfully');
      Should(subjectRepository.create).HaveBeenCalledWith(
        expect.objectContaining({ credits: 12, user: mockUser }),
      );
      Should(subjectRepository.save).HaveBeenCalledWith(mockCreatedSubject);
    });

    it('REG-F26-12: debe rechazar actualización de créditos de asignatura si no pertenece al rango permitido', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Materia Existente',
        credits: 4,
        user: mockUser,
      });

      await (
        await Should(() =>
          service.editSubject(mockUser.id, 1, {
            credits: -2,
          }),
        )
      ).ThrowAsync(
        new BadRequestException('The credits must be an integer between 1 and 12'),
      );
    });

    it('REG-F26-13: debe aislar estrictamente las consultas de carga académica por userId sin mezclar datos de otros usuarios', async () => {
      userService.findOneById.mockResolvedValue(mockUser);
      subjectRepository.findBy.mockResolvedValue([]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      await service.getAcademicLoadSummary(mockUser.id);

      Should(subjectRepository.findBy).HaveBeenCalledWith({
        user: { id: mockUser.id },
      });
      Should(subjectClassRepository.findBy).HaveBeenCalledWith({
        user: { id: mockUser.id },
      });
    });
  });
});
