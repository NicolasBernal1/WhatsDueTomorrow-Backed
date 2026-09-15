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
import { SimulateGradeDto } from './dtos/simulate-grade.dto';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationsService } from './evaluations.service';

const studentId = 1;
const otherStudentId = 999;
const subjectId = 10;
const ownedSubject = {
  id: subjectId,
  name: 'Cálculo Diferencial',
  user: { id: studentId },
} as Subject;
const foreignSubject = {
  id: subjectId,
  name: 'Cálculo Diferencial',
  user: { id: otherStudentId },
} as Subject;

describe('EvaluationsService (F25 — Caminos Básicos Backend Tabla 38)', () => {
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

  describe('Validaciones de Acceso y Propiedad de Asignatura (P2 y P3)', () => {
    it('[P2: 1 → 2 → 3 → 5 → 6 → 7 → 26] debe lanzar NotFoundException si la asignatura no existe en BD', async () => {
      subjectRepository.findOne.mockResolvedValue(null);

      await expect(service.getBySubject(studentId, 404)).rejects.toThrow(
        new NotFoundException('The subject does not exist'),
      );
      expect(evaluationRepository.find).not.toHaveBeenCalled();
    });

    it('[P3: 1 → 2 → 3 → 5 → 6 → 8 → 9 → 26] debe lanzar ForbiddenException si la asignatura pertenece a otro estudiante', async () => {
      subjectRepository.findOne.mockResolvedValue(foreignSubject);

      await expect(service.getBySubject(studentId, subjectId)).rejects.toThrow(
        new ForbiddenException('You cannot access this subject'),
      );
      expect(evaluationRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('Consulta de Evaluaciones (P4: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 11 → 12 → 26)', () => {
    it('[P4] debe retornar lista de evaluaciones con resumen ponderado completo cuando el usuario es dueño', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const mockEvals = [
        {
          id: 1,
          name: 'Parcial 1',
          weight: 30,
          score: 4.0,
          createdAt: new Date(),
          updatedAt: new Date(),
          subject: ownedSubject,
        } as Evaluation,
        {
          id: 2,
          name: 'Seguimiento',
          weight: 20,
          score: 3.5,
          createdAt: new Date(),
          updatedAt: new Date(),
          subject: ownedSubject,
        } as Evaluation,
      ];
      evaluationRepository.find.mockResolvedValue(mockEvals);

      const res = await service.getBySubject(studentId, subjectId);

      expect(res.status).toBe(200);
      expect(res.message).toBe('Evaluations retrieved successfully');
      expect(res.data.evaluations).toHaveLength(2);
      expect(res.data.summary.totalWeight).toBe(50);
      expect(res.data.summary.remainingWeight).toBe(50);
      // 4.0*0.3 + 3.5*0.2 = 1.2 + 0.7 = 1.9
      expect(res.data.summary.currentContribution).toBe(1.9);
      expect(res.data.summary.status).toBe('Aprobando');
    });
  });

  describe('Validación de Entradas en Creación (P5: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 13 → 14 → 26)', () => {
    beforeEach(() => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
    });

    it('[P5] debe rechazar creación cuando el nombre está vacío o sólo contiene espacios', async () => {
      await expect(
        service.create(studentId, subjectId, {
          name: '   ',
          weight: 20,
          score: 4.0,
        }),
      ).rejects.toThrow(new BadRequestException('The evaluation name cannot be empty'));

      await expect(
        service.create(studentId, subjectId, {
          name: '',
          weight: 20,
          score: 4.0,
        }),
      ).rejects.toThrow(new BadRequestException('The evaluation name cannot be empty'));
    });

    it('[P5] debe rechazar creación con peso fuera de rango (< 1 o > 100)', async () => {
      await expect(
        service.create(studentId, subjectId, {
          name: 'Quiz 1',
          weight: 0,
          score: 4.0,
        }),
      ).rejects.toThrow(
        new BadRequestException('The weight percentage must be between 1 and 100'),
      );

      await expect(
        service.create(studentId, subjectId, {
          name: 'Quiz 1',
          weight: 101,
          score: 4.0,
        }),
      ).rejects.toThrow(
        new BadRequestException('The weight percentage must be between 1 and 100'),
      );
    });

    it('[P5] debe rechazar creación con calificación fuera de rango (< 0.0 o > 5.0)', async () => {
      await expect(
        service.create(studentId, subjectId, {
          name: 'Quiz 1',
          weight: 20,
          score: -0.1,
        }),
      ).rejects.toThrow(
        new BadRequestException('The score must be between 0.0 and 5.0'),
      );

      await expect(
        service.create(studentId, subjectId, {
          name: 'Quiz 1',
          weight: 20,
          score: 5.1,
        }),
      ).rejects.toThrow(
        new BadRequestException('The score must be between 0.0 and 5.0'),
      );
    });
  });

  describe('Creación Exitosa de Evaluación (P6: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 13 → 15 → 26)', () => {
    it('[P6] debe guardar la evaluación con valores válidos y retornar la lista actualizada', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateEvaluationDto = {
        name: '  Examen Parcial 1  ',
        weight: 35,
        score: 4.25,
      };
      const createdEval = {
        id: 10,
        name: 'Examen Parcial 1',
        weight: 35,
        score: 4.25,
        subject: ownedSubject,
      } as Evaluation;

      evaluationRepository.create.mockReturnValue(createdEval);
      evaluationRepository.save.mockResolvedValue(createdEval);
      evaluationRepository.find.mockResolvedValue([createdEval]);

      const res = await service.create(studentId, subjectId, dto);

      expect(evaluationRepository.create).toHaveBeenCalledWith({
        name: 'Examen Parcial 1',
        weight: 35,
        score: 4.25,
        subject: ownedSubject,
      });
      expect(evaluationRepository.save).toHaveBeenCalledWith(createdEval);
      expect(res.status).toBe(200);
      expect(res.data.evaluations).toHaveLength(1);
    });
  });

  describe('Validación de Evaluación Inexistente en Mutación (P7: 10 → 16 → 17 → 18 → 26)', () => {
    it('[P7] debe lanzar NotFoundException si evaluationId no existe o no pertenece a la materia', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      evaluationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(studentId, subjectId, 999, { name: 'Cambio' }),
      ).rejects.toThrow(new NotFoundException('The evaluation does not exist'));

      await expect(
        service.remove(studentId, subjectId, 999),
      ).rejects.toThrow(new NotFoundException('The evaluation does not exist'));
    });
  });

  describe('Validación de Entradas en Actualización (P8: 10 → 16 → 17 → 19 → 20 → 21 → 26)', () => {
    let existingEval: Evaluation;

    beforeEach(() => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      existingEval = {
        id: 5,
        name: 'Taller Inicial',
        weight: 20,
        score: 3.5,
        subject: ownedSubject,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existingEval);
    });

    it('[P8] debe rechazar actualización si el nombre proporcionado está vacío', async () => {
      await expect(
        service.update(studentId, subjectId, 5, { name: '   ' }),
      ).rejects.toThrow(new BadRequestException('The evaluation name cannot be empty'));
    });

    it('[P8] debe rechazar actualización si el peso está fuera de rango (< 1 o > 100)', async () => {
      await expect(
        service.update(studentId, subjectId, 5, { weight: 0 }),
      ).rejects.toThrow(
        new BadRequestException('The weight percentage must be between 1 and 100'),
      );

      await expect(
        service.update(studentId, subjectId, 5, { weight: 101 }),
      ).rejects.toThrow(
        new BadRequestException('The weight percentage must be between 1 and 100'),
      );
    });

    it('[P8] debe rechazar actualización si la calificación está fuera de rango (< 0.0 o > 5.0)', async () => {
      await expect(
        service.update(studentId, subjectId, 5, { score: -0.5 }),
      ).rejects.toThrow(
        new BadRequestException('The score must be between 0.0 and 5.0'),
      );

      await expect(
        service.update(studentId, subjectId, 5, { score: 5.5 }),
      ).rejects.toThrow(
        new BadRequestException('The score must be between 0.0 and 5.0'),
      );
    });
  });

  describe('Actualización Exitosa de Evaluación (P9: 10 → 16 → 17 → 19 → 20 → 22 → 26)', () => {
    it('[P9] debe actualizar campos individuales (nombre, peso, nota) y retornar resumen actualizado', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existing = {
        id: 5,
        name: 'Taller 1',
        weight: 20,
        score: 3.0,
        subject: ownedSubject,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existing);
      evaluationRepository.save.mockResolvedValue(existing);
      evaluationRepository.find.mockResolvedValue([existing]);

      const updateDto: UpdateEvaluationDto = {
        name: 'Taller 1 Corregido',
        weight: 25,
        score: 4.8,
      };

      const res = await service.update(studentId, subjectId, 5, updateDto);

      expect(existing.name).toBe('Taller 1 Corregido');
      expect(existing.weight).toBe(25);
      expect(existing.score).toBe(4.8);
      expect(evaluationRepository.save).toHaveBeenCalledWith(existing);
      expect(res.status).toBe(200);
    });
  });

  describe('Eliminación de Evaluación (P10: 10 → 16 → 17 → 19 → 23 → 26)', () => {
    it('[P10] debe eliminar la entidad existente en BD y recalcular el estado local', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existing = {
        id: 5,
        name: 'Evaluación a Borrar',
        weight: 20,
        score: 3.0,
        subject: ownedSubject,
      } as Evaluation;
      evaluationRepository.findOne.mockResolvedValue(existing);
      evaluationRepository.remove.mockResolvedValue(existing);
      evaluationRepository.find.mockResolvedValue([]);

      const res = await service.remove(studentId, subjectId, 5);

      expect(evaluationRepository.remove).toHaveBeenCalledWith(existing);
      expect(res.status).toBe(200);
      expect(res.data.evaluations).toHaveLength(0);
      expect(res.data.summary.status).toBe('Sin calificaciones');
    });
  });

  describe('Simulador de Notas y Metas (P11 y P12: 10 → 24 → ... → 27 → 26)', () => {
    it('[P11: 10 → 24 → 25 → 27 → 26] simulación con peso restante <= 0 (peso agotado) retorna requiredForTarget null y isTargetAttainable false', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      // Evaluaciones completando el 100% de la ponderación con promedio bajo
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'Evaluación 100%',
          weight: 100,
          score: 2.5,
          subject: ownedSubject,
        } as Evaluation,
      ]);

      const simResult = await service.simulate(studentId, subjectId, {
        targetGrade: 3.0,
      });

      expect(simResult.status).toBe(200);
      expect(simResult.data.summary.remainingWeight).toBe(0);
      expect(simResult.data.requiredForTarget).toBeNull();
      expect(simResult.data.isTargetAttainable).toBe(false);
      expect(simResult.data.hypotheticalFinalGrade).toBeNull();
      expect(simResult.data.hypotheticalStatus).toBeNull();
    });

    it('[P12: 10 → 24 → 28 → 27 → 26] simulación con margen disponible y meta ya alcanzada por la contribución acumulada', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      // 5.0 con 70% de peso => contribución = 3.5 >= 3.0
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'Gran Parcial',
          weight: 70,
          score: 5.0,
          subject: ownedSubject,
        } as Evaluation,
      ]);

      const simResult = await service.simulate(studentId, subjectId, {
        targetGrade: 3.0,
        hypotheticalScore: 4.0,
      });

      expect(simResult.status).toBe(200);
      expect(simResult.data.requiredForTarget).toBe(0.0);
      expect(simResult.data.isTargetAttainable).toBe(true);
      // hypothetical: 3.5 + (4.0 * 30 / 100) = 3.5 + 1.2 = 4.7
      expect(simResult.data.hypotheticalFinalGrade).toBe(4.7);
      expect(simResult.data.hypotheticalStatus).toBe('Aprobando');
    });

    it('[P12] simulación con margen disponible, meta alcanzable y nota hipotética deficiente ("En riesgo")', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'Parcial 1',
          weight: 40,
          score: 3.0,
          subject: ownedSubject,
        } as Evaluation,
      ]);
      // contribución = 1.2, remainingWeight = 60%.
      // Para meta 3.0: (3.0 - 1.2) * 100 / 60 = 1.8 / 0.6 = 3.0.
      // Nota hipotética 2.0: 1.2 + (2.0 * 60 / 100) = 1.2 + 1.2 = 2.4 < 3.0 => En riesgo.
      const simResult = await service.simulate(studentId, subjectId, {
        targetGrade: 3.0,
        hypotheticalScore: 2.0,
      });

      expect(simResult.status).toBe(200);
      expect(simResult.data.requiredForTarget).toBe(3.0);
      expect(simResult.data.isTargetAttainable).toBe(true);
      expect(simResult.data.hypotheticalFinalGrade).toBe(2.4);
      expect(simResult.data.hypotheticalStatus).toBe('En riesgo');
    });

    it('[P12] simulación cuando la nota requerida supera el máximo 5.0 (inconseguible)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      evaluationRepository.find.mockResolvedValue([
        {
          id: 1,
          name: 'Parcial Desastroso',
          weight: 70,
          score: 0.5,
          subject: ownedSubject,
        } as Evaluation,
      ]);
      // contribución = 0.35, remainingWeight = 30%.
      // Para meta 3.0: (3.0 - 0.35) * 100 / 30 = 2.65 / 0.3 = 8.83 > 5.0!
      const simResult = await service.simulate(studentId, subjectId, {});

      expect(simResult.status).toBe(200);
      expect(simResult.data.targetGrade).toBe(3.0);
      expect(simResult.data.requiredForTarget).toBe(8.83);
      expect(simResult.data.isTargetAttainable).toBe(false);
      expect(simResult.data.hypotheticalScore).toBeNull();
    });

    it('[P12] simulación maneja excepción si getBySubject retorna datos nulos', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      jest.spyOn(service, 'getBySubject').mockResolvedValueOnce({
        status: 200,
        message: 'ok',
        data: null as any,
      });

      await expect(
        service.simulate(studentId, subjectId, { targetGrade: 3.5 }),
      ).rejects.toThrow(new NotFoundException('Evaluations could not be retrieved'));
    });
  });

  describe('Lógica Matemática y Cobertura de calculateSummary (RNF09, RF25)', () => {
    it('caso sin evaluaciones: promedio 0, restante 100%, nota requerida 3.0, "Sin calificaciones"', () => {
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

    it('caso promedio reprobatorio pero alcanzable (status "En riesgo" si currentAverage < 3.0)', () => {
      // 1 examen con 2.5 en 20%. Contribución 0.5. Promedio 2.5 (< 3.0).
      // Restante 80%. Requerido: (3.0 - 0.5) / 0.8 = 2.5 / 0.8 = 3.125 -> 3.13 (alcanzable <= 5.0)
      const evaluations = [
        { id: 1, name: 'Parcial 1', weight: 20, score: 2.5 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      expect(summary.currentAverage).toBe(2.5);
      expect(summary.isAttainable).toBe(true);
      expect(summary.status).toBe('En riesgo');
    });

    it('caso con 100% evaluado y nota final reprobada (< 3.0): requiredGrade null y status "En riesgo"', () => {
      const evaluations = [
        { id: 1, name: 'Final', weight: 100, score: 2.8 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      expect(summary.remainingWeight).toBe(0);
      expect(summary.requiredGrade).toBeNull();
      expect(summary.isAttainable).toBe(false);
      expect(summary.status).toBe('En riesgo');
    });

    it('caso precisión de coma flotante a 2 decimales exactos', () => {
      const evaluations = [
        { id: 1, name: 'E1', weight: 33.33, score: 3.14 } as Evaluation,
        { id: 2, name: 'E2', weight: 33.33, score: 2.71 } as Evaluation,
        { id: 3, name: 'E3', weight: 33.34, score: 4.0 } as Evaluation,
      ];

      const summary = service.calculateSummary(evaluations);

      expect(summary.totalWeight).toBe(100.0);
      expect(summary.remainingWeight).toBe(0.0);
      expect(summary.currentContribution.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(summary.currentAverage.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });
  });

  describe('Auditoría QA y Caracterización de Defectos (Metricas_Software_F21_F26.docx)', () => {
    it('[DEF-QA-F25-01] Comportamiento caracterizado: Backend permite evaluaciones individuales <= 100% que en conjunto superan el 100%', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const eval1 = { id: 1, name: 'Corte 1', weight: 60, score: 3.5, subject: ownedSubject } as Evaluation;
      const eval2 = { id: 2, name: 'Corte 2', weight: 50, score: 4.0, subject: ownedSubject } as Evaluation;

      evaluationRepository.find.mockResolvedValue([eval1, eval2]);

      const res = await service.getBySubject(studentId, subjectId);

      // Verificación de defecto QA DEF-QA-F25-01:
      // Se documenta que el backend no bloquea la suma acumulada superior al 100%,
      // reflejando totalWeight = 110%, remainingWeight = -10% y weightExceeded = true.
      expect(res.data.summary.totalWeight).toBe(110);
      expect(res.data.summary.remainingWeight).toBe(-10);
      expect(res.data.summary.weightExceeded).toBe(true);
    });

    it('[DEF-QA-F25-02] Comportamiento caracterizado: Simulación ante sobreponderación o peso negativo', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const eval1 = { id: 1, name: 'Corte 1', weight: 60, score: 3.5, subject: ownedSubject } as Evaluation;
      const eval2 = { id: 2, name: 'Corte 2', weight: 50, score: 4.0, subject: ownedSubject } as Evaluation;
      evaluationRepository.find.mockResolvedValue([eval1, eval2]);

      // Al tener remainingWeight = -10 (no > 0), simulate entra en la rama summary.remainingWeight <= 0
      // sin bloquear la operación ni alertar sobre la inconsistencia del porcentaje total
      const simResult = await service.simulate(studentId, subjectId, { targetGrade: 3.0 });

      // Verificación de defecto QA DEF-QA-F25-02:
      // Se documenta que el endpoint retorna 200 OK con requiredForTarget = null
      // en vez de rechazar con 400 Bad Request por inconsistencia en las ponderaciones.
      expect(simResult.status).toBe(200);
      expect(simResult.data.requiredForTarget).toBeNull();
      expect(simResult.data.isTargetAttainable).toBe(false);
    });
  });
});
