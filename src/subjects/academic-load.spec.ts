import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubjectsService, MIN_BALANCED_CREDITS, MAX_BALANCED_CREDITS, AUTONOMOUS_HOURS_MULTIPLIER } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';

describe('SubjectsService - Gestión de créditos y semáforo de carga semanal (HU26 / RF26-RF29)', () => {
  let service: SubjectsService;
  let subjectRepository: any;
  let subjectClassRepository: any;
  let userService: any;

  const userMock = { id: 1, name: 'Estudiante Test', email: 'test@student.edu' } as any;

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

  describe('RF26 — Asignación y validación de créditos (1 a 12 enteros)', () => {
    it('debe permitir crear una asignatura con créditos válidos en el rango (1 a 12)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      const createdMock = { id: 1, name: 'Cálculo', professor: 'Prof A', color: '#007bff', credits: 4, user: userMock };
      subjectRepository.create.mockReturnValue(createdMock);
      subjectRepository.save.mockResolvedValue(createdMock);

      const res = await service.addSubject(1, {
        name: 'Cálculo',
        professor: 'Prof A',
        color: '#007bff',
        credits: 4,
      });

      expect(res.status).toBe(201);
      expect(subjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ credits: 4 }),
      );
    });

    it('debe aceptar los valores límite de créditos: 1 (mínimo) y 12 (máximo)', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      // Límite inferior: 1
      subjectRepository.create.mockReturnValue({ id: 1, credits: 1 });
      subjectRepository.save.mockResolvedValue({ id: 1, credits: 1 });
      await expect(
        service.addSubject(1, { name: 'Materia 1', professor: 'Prof', credits: 1 }),
      ).resolves.toBeDefined();

      // Límite superior: 12
      subjectRepository.create.mockReturnValue({ id: 2, credits: 12 });
      subjectRepository.save.mockResolvedValue({ id: 2, credits: 12 });
      await expect(
        service.addSubject(1, { name: 'Materia 2', professor: 'Prof', credits: 12 }),
      ).resolves.toBeDefined();
    });

    it('debe rechazar créditos menores a 1 (ej: 0, -1)', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 0 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: -3 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar créditos mayores a 12 (ej: 13, 20)', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 13 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar créditos decimales (ej: 3.5, 4.2)', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 3.5 as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar valores no numéricos en créditos', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 'cuatro' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe validar créditos también al editar una asignatura', async () => {
      await expect(
        service.editSubject(10, { credits: 15 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.editSubject(10, { credits: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('RF27 & RF28 — Semáforo de carga y acumulación de créditos', () => {
    it('debe clasificar como "baja" cuando el total de créditos es menor a 12 (< 12)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      // 3 materias de 3 créditos = 9 créditos (< 12)
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 3 },
        { id: 2, name: 'M2', credits: 3 },
        { id: 3, name: 'M3', credits: 3 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(9);
      expect(result.data.status).toBe('baja');
      expect(result.data.statusLabel).toBe('Carga baja');
    });

    it('debe clasificar como "baja" con el valor frontera de 11 créditos', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 6 },
        { id: 2, name: 'M2', credits: 5 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(11);
      expect(result.data.status).toBe('baja');
    });

    it('debe clasificar como "balanceada" en el límite inferior inclusivo de 12 créditos', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 4 },
        { id: 2, name: 'M2', credits: 4 },
        { id: 3, name: 'M3', credits: 4 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(12);
      expect(result.data.status).toBe('balanceada');
      expect(result.data.statusLabel).toBe('Carga balanceada');
    });

    it('debe clasificar como "balanceada" en el límite superior inclusivo de 18 créditos', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 6 },
        { id: 2, name: 'M2', credits: 6 },
        { id: 3, name: 'M3', credits: 6 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(18);
      expect(result.data.status).toBe('balanceada');
      expect(result.data.statusLabel).toBe('Carga balanceada');
    });

    it('debe clasificar como "sobrecarga" en el valor frontera de 19 créditos (> 18)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 10 },
        { id: 2, name: 'M2', credits: 9 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(19);
      expect(result.data.status).toBe('sobrecarga');
      expect(result.data.statusLabel).toBe('Sobrecarga');
    });

    it('debe retornar 0 créditos y carga "baja" cuando el usuario no tiene asignaturas', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.totalCredits).toBe(0);
      expect(result.data.status).toBe('baja');
      expect(result.data.subjectsCount).toBe(0);
      expect(result.data.weeklyPresentialHours).toBe(0);
      expect(result.data.weeklyAutonomousHours).toBe(0);
    });
  });

  describe('RF29 — Estimación de horas de trabajo autónomo (horas presenciales x 2)', () => {
    it('debe calcular las horas presenciales y duplicarlas para el trabajo autónomo semanal', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Materia 1', credits: 4 },
      ]);
      // 2 clases: Lunes 08:00 a 10:00 (2h) + Miércoles 14:00 a 16:30 (2.5h) = 4.5h presenciales
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
        { id: 2, dayOfWeek: 'wednesday', startTime: '14:00', endTime: '16:30' },
      ]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.weeklyPresentialHours).toBe(4.5);
      expect(result.data.weeklyAutonomousHours).toBe(9.0); // 4.5 * 2 = 9
      expect(result.data.classesCount).toBe(2);
    });

    it('debe manejar correctamente múltiples clases entre varias asignaturas', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 3 },
        { id: 2, name: 'M2', credits: 3 },
      ]);
      // 3 bloques de 2 horas cada uno = 6 horas presenciales -> 12 horas autónomas
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
        { id: 2, dayOfWeek: 'tuesday', startTime: '10:00', endTime: '12:00' },
        { id: 3, dayOfWeek: 'friday', startTime: '14:00', endTime: '16:00' },
      ]);

      const result = await service.getAcademicLoadSummary(1);

      expect(result.data.weeklyPresentialHours).toBe(6);
      expect(result.data.weeklyAutonomousHours).toBe(12);
    });
  });
});
