/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationsService } from './evaluations.service';

const studentId = 1;
const otherStudentId = 999;
const subjectId = 10;
const ownedSubject = {
  id: subjectId,
  name: 'Cálculo',
  user: { id: studentId },
} as Subject;
const foreignSubject = {
  id: subjectId,
  name: 'Cálculo',
  user: { id: otherStudentId },
} as Subject;

describe('EvaluationsService (F25 - Calculadora y simulador de calificaciones)', () => {
  let service: EvaluationsService;
  let evaluationRepository: jest.Mocked<Repository<Evaluation>>;
  let subjectRepository: jest.Mocked<Repository<Subject>>;

  beforeEach(async () => {
    evaluationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;

    subjectRepository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        {
          provide: getRepositoryToken(Evaluation),
          useValue: evaluationRepository,
        },
        { provide: getRepositoryToken(Subject), useValue: subjectRepository },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
    jest.clearAllMocks();
  });

  describe('calculateSummary (Lógica matemática y precisión RNF09, RF25)', () => {
    it('caso sin evaluaciones: promedio 0, pendiente 100%, nota requerida 3.0, estado "Sin calificaciones"', () => {
      const summary = service.calculateSummary([]);

      expect(summary.totalWeight).toBe(0);
      expect(summary.remainingWeight).toBe(100);
      expect(summary.currentContribution).toBe(0);
      expect(summary.currentAverage).toBe(0);
      expect(summary.requiredGrade).toBe(3.0);
      expect(summary.isAttainable).toBe(true);
      expect(summary.status).toBe('Sin calificaciones');
      expect(summary.weightExceeded).toBe(false);
    });

    it('caso normal (Aprobando): parcial 30% con 3.5 y quices 20% con 4.0', () => {
      const evaluations = [
        { id: 1, name: 'Parcial 1', weight: 30, score: 3.5 } as Evaluation,
        { id: 2, name: 'Quices', weight: 20, score: 4.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      // totalWeight: 30 + 20 = 50%
      expect(summary.totalWeight).toBe(50);
      // remainingWeight: 100 - 50 = 50%
      expect(summary.remainingWeight).toBe(50);
      // contribution: 3.5 * 0.3 + 4.0 * 0.2 = 1.05 + 0.80 = 1.85
      expect(summary.currentContribution).toBe(1.85);
      // currentAverage: 1.85 / 0.50 = 3.70
      expect(summary.currentAverage).toBe(3.7);
      // requiredGrade: (3.0 - 1.85) / 0.50 = 1.15 / 0.50 = 2.30
      expect(summary.requiredGrade).toBe(2.3);
      expect(summary.isAttainable).toBe(true);
      expect(summary.status).toBe('Aprobando');
      expect(summary.weightExceeded).toBe(false);
    });

    it('caso Aprobado: cuando los puntos acumulados ya son >= 3.0 (HU25 CA3)', () => {
      const evaluations = [
        { id: 1, name: 'Parcial 1', weight: 40, score: 5.0 } as Evaluation,
        { id: 2, name: 'Parcial 2', weight: 30, score: 4.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      // contribution: 5.0*0.4 + 4.0*0.3 = 2.0 + 1.2 = 3.2 >= 3.0
      expect(summary.currentContribution).toBe(3.2);
      expect(summary.requiredGrade).toBe(0.0);
      expect(summary.isAttainable).toBe(true);
      expect(summary.status).toBe('Aprobado');
    });

    it('caso En riesgo / Nota matemáticamente inalcanzable (> 5.0) (RF25)', () => {
      const evaluations = [
        { id: 1, name: 'Parcial 1', weight: 60, score: 1.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      // contribution: 1.0 * 0.60 = 0.60
      // remaining: 40%
      // required: (3.0 - 0.60) / 0.40 = 2.40 / 0.40 = 6.00 (> 5.0)
      expect(summary.currentContribution).toBe(0.6);
      expect(summary.requiredGrade).toBe(6.0);
      expect(summary.isAttainable).toBe(false);
      expect(summary.status).toBe('En riesgo');
    });

    it('caso suma de porcentajes excede el 100% (RF25)', () => {
      const evaluations = [
        { id: 1, name: 'Parcial 1', weight: 60, score: 4.0 } as Evaluation,
        { id: 2, name: 'Parcial 2', weight: 50, score: 4.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      expect(summary.totalWeight).toBe(110);
      expect(summary.remainingWeight).toBe(-10);
      expect(summary.weightExceeded).toBe(true);
    });

    it('precisión a 2 cifras decimales sin errores de punto flotante (RNF09)', () => {
      const evaluations = [
        { id: 1, name: 'E1', weight: 33.33, score: 3.14 } as Evaluation,
        { id: 2, name: 'E2', weight: 33.33, score: 2.71 } as Evaluation,
        { id: 3, name: 'E3', weight: 33.34, score: 4.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      expect(summary.totalWeight).toBe(100.0);
      expect(summary.remainingWeight).toBe(0.0);
      // Validar que los números tengan máximo 2 decimales
      expect(summary.currentContribution.toString()).toMatch(
        /^\d+(\.\d{1,2})?$/,
      );
      expect(summary.currentAverage.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });
  });

  describe('getBySubject', () => {
    it('debe listar evaluaciones y retornar resumen calculado', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'Taller 1',
          weight: 20,
          score: 4.5,
          subject: ownedSubject,
        } as Evaluation,
      ]);

      const result = await service.getBySubject(studentId, subjectId);

      expect(result.status).toBe(200);
      expect(result.data.evaluations).toHaveLength(1);
      expect(result.data.summary.totalWeight).toBe(20);
      expect(result.data.summary.currentAverage).toBe(4.5);
    });

    it('debe rechazar si la materia pertenece a otro estudiante (aislamiento de datos Objetivo 2)', async () => {
      subjectRepository.findOne.mockResolvedValue(foreignSubject);

      await expect(service.getBySubject(studentId, subjectId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(evaluationRepository.find).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la asignatura no existe', async () => {
      subjectRepository.findOne.mockResolvedValue(null);

      await expect(service.getBySubject(studentId, 404)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe crear evaluación con nombre, peso y nota válidos (HU25 CA1)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateEvaluationDto = {
        name: 'Parcial Final',
        weight: 35,
        score: 4.2,
      };
      const created = { id: 10, ...dto, subject: ownedSubject } as Evaluation;
      evaluationRepository.create.mockReturnValue(created);
      evaluationRepository.save.mockResolvedValue(created);
      evaluationRepository.find.mockResolvedValue([created]);

      const result = await service.create(studentId, subjectId, dto);

      expect(evaluationRepository.create).toHaveBeenCalledWith({
        name: 'Parcial Final',
        weight: 35,
        score: 4.2,
        subject: ownedSubject,
      });
      expect(result.status).toBe(200);
      expect(result.data.evaluations).toHaveLength(1);
    });

    it('debe rechazar si el nombre está vacío', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateEvaluationDto = {
        name: '   ',
        weight: 20,
        score: 3.0,
      };

      await expect(service.create(studentId, subjectId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe rechazar peso fuera de rango (< 1 o > 100)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);

      await expect(
        service.create(studentId, subjectId, {
          name: 'E1',
          weight: 0,
          score: 3.0,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(studentId, subjectId, {
          name: 'E1',
          weight: 101,
          score: 3.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar nota fuera de rango (< 0.0 o > 5.0)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);

      await expect(
        service.create(studentId, subjectId, {
          name: 'E1',
          weight: 20,
          score: -0.5,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(studentId, subjectId, {
          name: 'E1',
          weight: 20,
          score: 5.5,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debe actualizar campos de la evaluación previa validación de propiedad (HU25 CA3)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existing = {
        id: 5,
        name: 'Viejo',
        weight: 20,
        score: 3.0,
        subject: ownedSubject,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existing);
      evaluationRepository.save.mockResolvedValue(existing);
      evaluationRepository.find.mockResolvedValue([existing]);

      const updateDto: UpdateEvaluationDto = {
        name: 'Nuevo Nombre',
        score: 4.5,
      };

      const result = await service.update(studentId, subjectId, 5, updateDto);

      expect(existing.name).toBe('Nuevo Nombre');
      expect(existing.score).toBe(4.5);
      expect(result.status).toBe(200);
    });

    it('debe rechazar actualización con nota fuera de rango', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existing = {
        id: 5,
        name: 'E',
        weight: 20,
        score: 3.0,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existing);

      await expect(
        service.update(studentId, subjectId, 5, { score: 6.0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la evaluación y recalcular el resumen (HU25 CA3)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existing = {
        id: 5,
        name: 'E',
        weight: 20,
        score: 3.0,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existing);
      evaluationRepository.remove.mockResolvedValue(existing);
      evaluationRepository.find.mockResolvedValue([]);

      const result = await service.remove(studentId, subjectId, 5);

      expect(evaluationRepository.remove).toHaveBeenCalledWith(existing);
      expect(result.status).toBe(200);
      expect(result.data.evaluations).toHaveLength(0);
      expect(result.data.summary.status).toBe('Sin calificaciones');
    });
  });

  describe('simulate (Simulador interactivo HU25 CA2)', () => {
    it('debe calcular nota final hipotética y meta de calificación', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'P1',
          weight: 50,
          score: 3.0,
          subject: ownedSubject,
        } as Evaluation,
      ]);

      const simResult = await service.simulate(studentId, subjectId, {
        targetGrade: 3.5,
        hypotheticalScore: 4.0,
      });

      expect(simResult.status).toBe(200);
      expect(simResult.data.targetGrade).toBe(3.5);
      // P1 contribución = 1.5. Para llegar a 3.5 en 50%: (3.5 - 1.5) / 0.5 = 4.0
      expect(simResult.data.requiredForTarget).toBe(4.0);
      expect(simResult.data.isTargetAttainable).toBe(true);
      // Hipotético con 4.0 en 50%: 1.5 + 4.0 * 0.5 = 3.5
      expect(simResult.data.hypotheticalFinalGrade).toBe(3.5);
      expect(simResult.data.hypotheticalStatus).toBe('Aprobando');
    });
  });
});
