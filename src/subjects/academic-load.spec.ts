import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubjectsService, MIN_BALANCED_CREDITS, MAX_BALANCED_CREDITS, AUTONOMOUS_HOURS_MULTIPLIER } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';

describe('SubjectsService - F26 Gestión de créditos y semáforo de carga semanal (Tabla 49 Backend)', () => {
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

  describe('Seguridad y Guards (P1: 1 → 2 → 3 → 4 → 26)', () => {
    it('[P1] debe verificar que SubjectsController tiene aplicado AuthGuard("jwt") para proteger endpoints de F26', () => {
      const guards = Reflect.getMetadata('__guards__', SubjectsController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
      const guardInstance = new guards[0]();
      expect(guardInstance).toBeInstanceOf(AuthGuard('jwt'));
    });
  });

  describe('Validación de Existencia del Usuario (P2: 1 → 2 → 3 → 5 → 6 → 7 → 26)', () => {
    it('[P2] debe lanzar NotFoundException si el usuario autenticado no existe en BD al consultar academic-load', async () => {
      userService.findOneById.mockResolvedValue(null);

      await expect(service.getAcademicLoadSummary(999)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(subjectRepository.findBy).not.toHaveBeenCalled();
    });

    it('[P2] debe lanzar NotFoundException si el usuario no existe al registrar asignatura (addSubject)', async () => {
      userService.findOneById.mockResolvedValue(null);

      await expect(
        service.addSubject(999, { name: 'Materia', professor: 'Prof', color: '#0078d4', credits: 3 }),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('Semáforo de Carga Semanal (P3, P4, P5: 8 → 9 → 10 → ... → 16 → 26)', () => {
    it('[P3: 10 → 11 → 14 → 16] debe clasificar como "baja" (< 12 créditos) y calcular horas proporcionales', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 4 },
        { id: 2, name: 'M2', credits: 4 },
      ]);
      // 1 clase de 2 horas (120 minutos)
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
      ]);

      const res = await service.getAcademicLoadSummary(1);

      expect(res.status).toBe(200);
      expect(res.data.totalCredits).toBe(8);
      expect(res.data.status).toBe('baja');
      expect(res.data.statusLabel).toBe('Carga baja');
      expect(res.data.weeklyPresentialHours).toBe(2);
      expect(res.data.weeklyAutonomousHours).toBe(4);
    });

    it('[P4: 10 → 12 → 13 → 14 → 16] debe clasificar como "balanceada" en el rango recomendado (12 a 18 créditos)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 4 },
        { id: 2, name: 'M2', credits: 4 },
        { id: 3, name: 'M3', credits: 4 },
        { id: 4, name: 'M4', credits: 3 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const res = await service.getAcademicLoadSummary(1);

      expect(res.status).toBe(200);
      expect(res.data.totalCredits).toBe(15);
      expect(res.data.status).toBe('balanceada');
      expect(res.data.statusLabel).toBe('Carga balanceada');
    });

    it('[P4] debe clasificar como "balanceada" en los límites frontera exactos de 12 y 18 créditos', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectClassRepository.findBy.mockResolvedValue([]);

      // Límite inferior: 12
      subjectRepository.findBy.mockResolvedValue([{ id: 1, credits: 12 }]);
      const res12 = await service.getAcademicLoadSummary(1);
      expect(res12.data.status).toBe('balanceada');

      // Límite superior: 18
      subjectRepository.findBy.mockResolvedValue([{ id: 1, credits: 18 }]);
      const res18 = await service.getAcademicLoadSummary(1);
      expect(res18.data.status).toBe('balanceada');
    });

    it('[P5: 10 → 12 → 15 → 14 → 16] debe clasificar como "sobrecarga" cuando totalCredits supera 18 (> 18 cr)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 10 },
        { id: 2, name: 'M2', credits: 10 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const res = await service.getAcademicLoadSummary(1);

      expect(res.status).toBe(200);
      expect(res.data.totalCredits).toBe(20);
      expect(res.data.status).toBe('sobrecarga');
      expect(res.data.statusLabel).toBe('Sobrecarga');
    });

    it('debe manejar usuario sin asignaturas: 0 créditos, carga "baja", 0 horas presenciales y 0 horas autónomas', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const res = await service.getAcademicLoadSummary(1);

      expect(res.data.totalCredits).toBe(0);
      expect(res.data.status).toBe('baja');
      expect(res.data.subjectsCount).toBe(0);
      expect(res.data.weeklyPresentialHours).toBe(0);
      expect(res.data.weeklyAutonomousHours).toBe(0);
    });

    it('debe asignar 3 créditos por defecto si la asignatura tiene credits null o undefined', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: null },
        { id: 2, name: 'M2', credits: undefined },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const res = await service.getAcademicLoadSummary(1);

      expect(res.data.totalCredits).toBe(6);
    });
  });

  describe('Validación y Creación de Asignatura con Créditos (P6 y P7: 8 → 17 → ... → 26)', () => {
    it('[P6: 17 → 18 → 26] debe rechazar creación con créditos fuera de rango 1..12 o no enteros', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 0 }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 13 }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 3.5 as any }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));

      await expect(
        service.addSubject(1, { name: 'Materia', professor: 'Prof', credits: 'texto' as any }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));
    });

    it('[P7: 17 → 19 → 20 → 26] debe crear la asignatura exitosamente con créditos válidos (1 a 12 enteros)', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      const created = { id: 1, name: 'Cálculo', professor: 'Prof A', color: '#007bff', credits: 4, user: userMock };
      subjectRepository.create.mockReturnValue(created);
      subjectRepository.save.mockResolvedValue(created);

      const res = await service.addSubject(1, {
        name: 'Cálculo',
        professor: 'Prof A',
        color: '#007bff',
        credits: 4,
      });

      expect(res.status).toBe(201);
      expect(res.message).toBe('Subject created successfully');
      expect(subjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ credits: 4, user: userMock }),
      );
      expect(subjectRepository.save).toHaveBeenCalledWith(created);
    });

    it('[P7] debe aceptar los valores límite de créditos: 1 (mínimo) y 12 (máximo)', async () => {
      userService.findOneById.mockResolvedValue(userMock);

      subjectRepository.create.mockReturnValue({ id: 1, credits: 1 });
      subjectRepository.save.mockResolvedValue({ id: 1, credits: 1 });
      const resMin = await service.addSubject(1, { name: 'M1', professor: 'P', credits: 1 });
      expect(resMin.status).toBe(201);

      subjectRepository.create.mockReturnValue({ id: 2, credits: 12 });
      subjectRepository.save.mockResolvedValue({ id: 2, credits: 12 });
      const resMax = await service.addSubject(1, { name: 'M2', professor: 'P', credits: 12 });
      expect(resMax.status).toBe(201);
    });
  });

  describe('Actualización de Créditos y Asignatura (P8, P9, P10: 8 → 21 → ... → 26)', () => {
    it('[P8: 21 → 22 → 26] debe rechazar edición si credits está fuera de rango 1..12 o no es entero', async () => {
      await expect(
        service.editSubject(10, { credits: 0 }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));

      await expect(
        service.editSubject(10, { credits: 15 }),
      ).rejects.toThrow(new BadRequestException('The credits must be an integer between 1 and 12'));
    });

    it('[P9: 21 → 23 → 24 → 25 → 26] debe lanzar NotFoundException si subjectId no existe en BD al editar', async () => {
      subjectRepository.preload.mockResolvedValue(undefined);

      await expect(
        service.editSubject(404, { credits: 4 }),
      ).rejects.toThrow(new NotFoundException('The subject does not exist'));
    });

    it('[P10: 21 → 23 → 24 → 27 → 26] debe actualizar exitosamente la asignatura existente con nuevos créditos', async () => {
      const updatedSubject = { id: 10, name: 'Física', credits: 4 };
      subjectRepository.preload.mockResolvedValue(updatedSubject);
      subjectRepository.save.mockResolvedValue(updatedSubject);

      const res = await service.editSubject(10, { credits: 4 });

      expect(res.status).toBe(200);
      expect(res.message).toBe('Subject updated successfully');
      expect(subjectRepository.preload).toHaveBeenCalledWith({
        id: 10,
        credits: 4,
      });
      expect(subjectRepository.save).toHaveBeenCalledWith(updatedSubject);
    });
  });

  describe('Eliminación de Asignatura (P11 y P12: 8 → 28 → 29 → ... → 26)', () => {
    it('[P11: 28 → 29 → 25 → 26] debe lanzar NotFoundException si la asignatura a eliminar no existe en BD', async () => {
      subjectRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(404)).rejects.toThrow(
        new NotFoundException('The subject does not exist'),
      );
      expect(subjectRepository.delete).not.toHaveBeenCalled();
    });

    it('[P12: 28 → 29 → 30 → 26] debe eliminar físicamente la asignatura existente en BD', async () => {
      const existing = { id: 10, name: 'Química', credits: 3 };
      subjectRepository.findOneBy.mockResolvedValue(existing);
      subjectRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const res = await service.remove(10);

      expect(res.status).toBe(200);
      expect(res.message).toBe('Subject deleted successfully');
      expect(subjectRepository.delete).toHaveBeenCalledWith(10);
    });
  });

  describe('Auditoría QA y Caracterización de Defectos (Metricas_Software_F21_F26.docx)', () => {
    it('[DEF-QA-F26-01] Comportamiento caracterizado: Backend acepta nombres de asignatura y docentes arbitrarios o incoherentes', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      const strangeSubject = {
        name: '12345a',
        professor: '11111b',
        color: '#0078d4',
        credits: 3,
        user: userMock,
      };
      subjectRepository.create.mockReturnValue(strangeSubject);
      subjectRepository.save.mockResolvedValue(strangeSubject);

      const res = await service.addSubject(1, {
        name: '12345a',
        professor: '11111b',
        color: '#0078d4',
        credits: 3,
      });

      // Verificación de defecto QA DEF-QA-F26-01:
      // Se documenta que el backend acepta nombres arbitrarios sin validación semántica
      expect(res.status).toBe(201);
      expect(subjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: '12345a', professor: '11111b' }),
      );
    });

    it('[DEF-QA-F26-02] Comportamiento caracterizado: Asignaturas duplicadas para el mismo usuario inflan el semáforo', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      // Dos materias con el mismo nombre "Cálculo I" con 4 créditos cada una
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'Cálculo I', credits: 4 },
        { id: 2, name: 'Cálculo I', credits: 4 },
      ]);
      subjectClassRepository.findBy.mockResolvedValue([]);

      const res = await service.getAcademicLoadSummary(1);

      // Verificación de defecto QA DEF-QA-F26-02:
      // Se documenta que el backend no valida unicidad de nombre de materia por usuario,
      // sumando los créditos de ambas (4 + 4 = 8 créditos) y duplicando la carga
      expect(res.data.totalCredits).toBe(8);
      expect(res.data.subjectsCount).toBe(2);
    });

    it('[DEF-QA-F26-03] Comportamiento caracterizado: Suma lineal ciega de duraciones de clases en horarios solapados', async () => {
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findBy.mockResolvedValue([
        { id: 1, name: 'M1', credits: 4 },
        { id: 2, name: 'M2', credits: 4 },
      ]);
      // Dos clases simultáneas el mismo lunes de 08:00 a 10:00 (2 horas físicas reales)
      subjectClassRepository.findBy.mockResolvedValue([
        { id: 1, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
        { id: 2, dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00' },
      ]);

      const res = await service.getAcademicLoadSummary(1);

      // Verificación de defecto QA DEF-QA-F26-03:
      // Se documenta que el algoritmo suma ambas duraciones linealmente (2h + 2h = 4h presenciales),
      // lo que infla las horas de trabajo autónomo a 8h (en vez de 4h)
      expect(res.data.weeklyPresentialHours).toBe(4);
      expect(res.data.weeklyAutonomousHours).toBe(8);
    });
  });
});
