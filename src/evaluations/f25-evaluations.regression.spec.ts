import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationsService } from './evaluations.service';
import { Should } from '../common/fluent-assertions';

/**
 * ============================================================================
 * SUITE DE PRUEBAS DE REGRESIÓN — F25: PROMEDIO PONDERADO Y SIMULADOR
 * ============================================================================
 * Objetivo de Regresión:
 * Garantizar que modificaciones futuras en la precisión aritmética (evitar fallos
 * IEEE 754), transiciones de la máquina de estados de aprobación académica,
 * fórmulas de simulación de notas hipotéticas o controles de acceso multiusuario
 * no alteren los cálculos ni clasifiquen incorrectamente el rendimiento académico.
 */
describe('F25 Regression Suite: Cálculo dinámico de promedio ponderado y simulador (Backend)', () => {
  let service: EvaluationsService;

  const userStudent = { id: 25, name: 'Estudiante Matemáticas' };
  const userOther = { id: 88, name: 'Estudiante Ajeno' };

  const subjectMath = {
    id: 12,
    name: 'Cálculo Integral',
    user: userStudent,
  } as Subject;

  const mockEvaluationRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSubjectRepo = {
    findOne: jest.fn(),
  };

  function createEvaluationEntity(overrides: Partial<Evaluation> = {}): Evaluation {
    return {
      id: 1,
      name: 'Parcial 1',
      weight: 30,
      score: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      subject: subjectMath,
      ...overrides,
    } as Evaluation;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationsService,
        { provide: getRepositoryToken(Evaluation), useValue: mockEvaluationRepo },
        { provide: getRepositoryToken(Subject), useValue: mockSubjectRepo },
      ],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 1: Precisión Aritmética en Ponderación y Acumulado (round2)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 1: Precisión Aritmética y Redondeo a 2 Decimales (round2)', () => {
    it('debe calcular exactamente totalWeight, currentContribution y currentAverage sin errores IEEE 754', () => {
      // 3 evaluaciones con pesos y notas fraccionarias propensas a errores de punto flotante
      const evaluations = [
        createEvaluationEntity({ id: 1, weight: 33.33, score: 3.75 }),
        createEvaluationEntity({ id: 2, weight: 33.33, score: 4.25 }),
        createEvaluationEntity({ id: 3, weight: 33.34, score: 2.8 }),
      ];

      const summary = service.calculateSummary(evaluations);

      // totalWeight: 33.33 + 33.33 + 33.34 = 100.00
      summary.totalWeight.Should().Be(100);
      summary.remainingWeight.Should().Be(0);
      summary.weightExceeded.Should().BeFalse();

      // currentContribution y currentAverage
      // (3.75*33.33 + 4.25*33.33 + 2.8*33.34)/100 = 1.249875 + 1.416525 + 0.93352 = 3.6
      summary.currentContribution.Should().Be(3.6);
      summary.currentAverage.Should().Be(3.6);
    });

    it('debe manejar caso sin evaluaciones retornando promedios 0 y status "Sin calificaciones"', () => {
      const summary = service.calculateSummary([]);

      summary.totalWeight.Should().Be(0);
      summary.remainingWeight.Should().Be(100);
      summary.currentContribution.Should().Be(0);
      summary.currentAverage.Should().Be(0);
      summary.requiredGrade.Should().Be(3.0);
      summary.isAttainable.Should().BeTrue();
      summary.status.Should().Be('Sin calificaciones');
      summary.isPassing.Should().BeFalse();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 2: Máquina de Estados de Aprobación Académica (ApprovalStatus)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 2: Transiciones de la Máquina de Estados de Aprobación', () => {
    it('debe asignar "Aprobado" y requiredGrade = 0.0 cuando currentContribution alcanza o supera 3.0', () => {
      // Dos notas de 5.0 con 30% cada una -> aporte = 1.5 + 1.5 = 3.0 (aprobado con 60% evaluado)
      const evs = [
        createEvaluationEntity({ id: 1, weight: 30, score: 5.0 }),
        createEvaluationEntity({ id: 2, weight: 30, score: 5.0 }),
      ];

      const summary = service.calculateSummary(evs);

      summary.currentContribution.Should().Be(3.0);
      summary.status.Should().Be('Aprobado');
      summary.requiredGrade.Should().Be(0.0);
      summary.isAttainable.Should().BeTrue();
      summary.isPassing.Should().BeTrue();
    });

    it('debe asignar "Aprobando" cuando el promedio parcial es >= 3.0 y la meta es alcanzable (requiredGrade <= 5.0)', () => {
      // Un parcial con peso 20% y nota 4.0 -> aporte = 0.8, promedio actual = 4.0
      // Nota requerida para 3.0 en el 80% restante = (3.0 - 0.8)*100/80 = 2.75 <= 5.0
      const evs = [createEvaluationEntity({ id: 1, weight: 20, score: 4.0 })];

      const summary = service.calculateSummary(evs);

      summary.currentContribution.Should().Be(0.8);
      summary.currentAverage.Should().Be(4.0);
      summary.requiredGrade.Should().Be(2.75);
      summary.isAttainable.Should().BeTrue();
      summary.status.Should().Be('Aprobando');
      summary.isPassing.Should().BeTrue();
    });

    it('debe asignar "En riesgo" cuando la meta de aprobación es matemáticamente inalcanzable (requiredGrade > 5.0)', () => {
      // 80% calificado con notas muy bajas: 80% con 1.0 -> aporte = 0.8
      // Falta 20%. Para llegar a 3.0 necesita: (3.0 - 0.8)*100 / 20 = 11.0 > 5.0 (Imposible)
      const evs = [createEvaluationEntity({ id: 1, weight: 80, score: 1.0 })];

      const summary = service.calculateSummary(evs);

      summary.currentContribution.Should().Be(0.8);
      summary.requiredGrade.Should().Be(11.0);
      summary.isAttainable.Should().BeFalse();
      summary.status.Should().Be('En riesgo');
      summary.isPassing.Should().BeFalse();
    });

    it('debe marcar isAttainable = false y requiredGrade = null si el peso restante es 0 y no aprobó', () => {
      // 100% evaluado con nota final 2.5
      const evs = [createEvaluationEntity({ id: 1, weight: 100, score: 2.5 })];

      const summary = service.calculateSummary(evs);

      summary.currentContribution.Should().Be(2.5);
      summary.remainingWeight.Should().Be(0);
      Should(summary.requiredGrade).BeNull();
      summary.isAttainable.Should().BeFalse();
      summary.status.Should().Be('En riesgo');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 3: Simulación de Escenarios Hipotéticos (simulate)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 3: Simulador de Notas Hipotéticas (simulate)', () => {
    it('debe calcular requiredForTarget y proyectar nota final con escenario hipotético', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);
      // Evaluado 40% con nota 3.5 -> aporte = 1.4, falta 60%
      mockEvaluationRepo.find.mockResolvedValue([
        createEvaluationEntity({ id: 1, weight: 40, score: 3.5 }),
      ]);

      const result = await service.simulate(userStudent.id, subjectMath.id, {
        targetGrade: 4.0,
        hypotheticalScore: 4.5,
      });

      result.status.Should().Be(200);
      const data = result.data!;

      // Para meta de 4.0: (4.0 - 1.4)*100 / 60 = 2.6 / 0.6 = 4.33
      data.targetGrade.Should().Be(4.0);
      data.requiredForTarget.Should().Be(4.33);
      data.isTargetAttainable.Should().BeTrue();

      // Con hipotético de 4.5 en el 60% restante:
      // aporte hipotético = 1.4 + (4.5 * 60)/100 = 1.4 + 2.7 = 4.1
      data.hypotheticalScore.Should().Be(4.5);
      data.hypotheticalFinalGrade.Should().Be(4.1);
      data.hypotheticalStatus.Should().Be('Aprobando');
    });

    it('debe retornar requiredForTarget = 0.0 si el aporte actual ya supera la meta deseada', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);
      mockEvaluationRepo.find.mockResolvedValue([
        createEvaluationEntity({ id: 1, weight: 80, score: 4.5 }), // Aporte = 3.6
      ]);

      const result = await service.simulate(userStudent.id, subjectMath.id, {
        targetGrade: 3.0,
      });

      result.data!.requiredForTarget.Should().Be(0.0);
      result.data!.isTargetAttainable.Should().BeTrue();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 4: Reglas de Validación de Dominio (Pesos 1-100, Notas 0-5)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 4: Validación de Dominio de Calificaciones y Pesos', () => {
    it('debe rechazar con BadRequestException notas fuera del rango [0.0, 5.0]', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);

      // Nota negativa
      await Should(async () =>
        service.create(userStudent.id, subjectMath.id, {
          name: 'Examen',
          weight: 20,
          score: -0.5,
        }),
      ).ThrowAsync('The score must be between 0.0 and 5.0');

      // Nota superior a 5.0
      await Should(async () =>
        service.create(userStudent.id, subjectMath.id, {
          name: 'Examen',
          weight: 20,
          score: 5.5,
        }),
      ).ThrowAsync('The score must be between 0.0 and 5.0');

      Should(mockEvaluationRepo.save).NotHaveBeenCalled();
    });

    it('debe rechazar con BadRequestException porcentajes de peso fuera del rango [1, 100]', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);

      // Peso 0
      await Should(async () =>
        service.create(userStudent.id, subjectMath.id, {
          name: 'Quiz',
          weight: 0,
          score: 4.0,
        }),
      ).ThrowAsync('The weight percentage must be between 1 and 100');

      // Peso mayor a 100
      await Should(async () =>
        service.create(userStudent.id, subjectMath.id, {
          name: 'Proyecto',
          weight: 105,
          score: 4.0,
        }),
      ).ThrowAsync(BadRequestException);

      Should(mockEvaluationRepo.save).NotHaveBeenCalled();
    });

    it('debe rechazar con BadRequestException nombres vacíos o puros espacios', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);

      await Should(async () =>
        service.create(userStudent.id, subjectMath.id, {
          name: '     ',
          weight: 20,
          score: 4.0,
        }),
      ).ThrowAsync('The evaluation name cannot be empty');

      Should(mockEvaluationRepo.save).NotHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 5: Control de Acceso y Aislamiento Multiusuario (Anti-IDOR)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 5: Aislamiento Multiusuario y Control de Acceso (Anti-IDOR)', () => {
    it('debe impedir que un usuario ajeno consulte, cree, edite, elimine o simule notas de otra materia', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectMath);

      // getBySubject con usuario ajeno
      await Should(async () =>
        service.getBySubject(userOther.id, subjectMath.id),
      ).ThrowAsync('You cannot access this subject');

      // create con usuario ajeno
      await Should(async () =>
        service.create(userOther.id, subjectMath.id, {
          name: 'Intrusión',
          weight: 20,
          score: 5.0,
        }),
      ).ThrowAsync(ForbiddenException);

      // simulate con usuario ajeno
      await Should(async () =>
        service.simulate(userOther.id, subjectMath.id, { targetGrade: 3.0 }),
      ).ThrowAsync(ForbiddenException);

      Should(mockEvaluationRepo.save).NotHaveBeenCalled();
    });

    it('debe responder NotFoundException ante materias o evaluaciones inexistentes', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(null);

      await Should(async () =>
        service.getBySubject(userStudent.id, 9999),
      ).ThrowAsync('The subject does not exist');
    });
  });
});
