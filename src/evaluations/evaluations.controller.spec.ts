/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { SimulateGradeDto } from './dtos/simulate-grade.dto';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { EvaluationListResponseDto } from './dtos/evaluation-list-response.dto';
import { SimulationResultDto } from './dtos/simulate-grade.dto';

describe('EvaluationsController (F25 — Caminos Básicos Backend Tabla 38)', () => {
  let controller: EvaluationsController;
  let service: jest.Mocked<EvaluationsService>;

  const mockUserReq = { user: { sub: 1, email: 'student@eafit.edu.co' } };

  beforeEach(async () => {
    service = {
      getBySubject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      simulate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [{ provide: EvaluationsService, useValue: service }],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('Seguridad y Guards (P1: 1 → 2 → 3 → 4 → 26)', () => {
    it('[P1] debe tener aplicado AuthGuard("jwt") a nivel de controlador para proteger endpoints F25', () => {
      const guards = Reflect.getMetadata('__guards__', EvaluationsController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
      const guardInstance = new guards[0]();
      expect(guardInstance).toBeInstanceOf(AuthGuard('jwt'));
    });
  });

  describe('GET /subjects/:subjectId/evaluations (P4: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 11 → 12 → 26)', () => {
    it('[P4] debe delegar la consulta de evaluaciones al servicio con userId y subjectId', async () => {
      const mockResponse: BaseResponseDto<EvaluationListResponseDto> = {
        status: 200,
        message: 'Evaluations retrieved successfully',
        data: {
          evaluations: [
            {
              id: 1,
              name: 'Parcial 1',
              weight: 30,
              score: 4.0,
              createdAt: new Date(),
              updatedAt: new Date(),
              subjectId: 10,
            },
          ],
          summary: {
            totalWeight: 30,
            remainingWeight: 70,
            currentContribution: 1.2,
            currentAverage: 4.0,
            requiredGrade: 2.57,
            isPassing: true,
            isAttainable: true,
            status: 'Aprobando',
            weightExceeded: false,
            passingGrade: 3.0,
            maxGrade: 5.0,
          },
        },
      };
      service.getBySubject.mockResolvedValue(mockResponse);

      const res = await controller.getBySubject(mockUserReq, 10);

      expect(service.getBySubject).toHaveBeenCalledWith(1, 10);
      expect(res).toEqual(mockResponse);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /subjects/:subjectId/evaluations (P6: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 13 → 15 → 26)', () => {
    it('[P6] debe delegar la creación de una evaluación con DTO válido al servicio', async () => {
      const dto: CreateEvaluationDto = {
        name: 'Parcial 2',
        weight: 30,
        score: 4.5,
      };
      const mockResponse: BaseResponseDto<EvaluationListResponseDto> = {
        status: 200,
        message: 'Evaluations retrieved successfully',
        data: {
          evaluations: [],
          summary: {} as any,
        },
      };
      service.create.mockResolvedValue(mockResponse);

      const res = await controller.create(mockUserReq, 10, dto);

      expect(service.create).toHaveBeenCalledWith(1, 10, dto);
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /subjects/:subjectId/evaluations/:evaluationId (P9: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 16 → 17 → 19 → 20 → 22 → 26)', () => {
    it('[P9] debe delegar la actualización parcial de una evaluación al servicio', async () => {
      const dto: UpdateEvaluationDto = {
        name: 'Parcial 1 Modificado',
        score: 4.8,
      };
      const mockResponse: BaseResponseDto<EvaluationListResponseDto> = {
        status: 200,
        message: 'Evaluations retrieved successfully',
        data: {
          evaluations: [],
          summary: {} as any,
        },
      };
      service.update.mockResolvedValue(mockResponse);

      const res = await controller.update(mockUserReq, 10, 5, dto);

      expect(service.update).toHaveBeenCalledWith(1, 10, 5, dto);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /subjects/:subjectId/evaluations/:evaluationId (P10: 1 → 2 → 3 → 5 → 6 → 8 → 10 → 16 → 17 → 19 → 23 → 26)', () => {
    it('[P10] debe delegar la eliminación física de la evaluación al servicio', async () => {
      const mockResponse: BaseResponseDto<EvaluationListResponseDto> = {
        status: 200,
        message: 'Evaluations retrieved successfully',
        data: {
          evaluations: [],
          summary: {} as any,
        },
      };
      service.remove.mockResolvedValue(mockResponse);

      const res = await controller.remove(mockUserReq, 10, 5);

      expect(service.remove).toHaveBeenCalledWith(1, 10, 5);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /subjects/:subjectId/evaluations/simulate (P11/P12: 10 → 24 → ... → 27 → 26)', () => {
    it('[P12] debe delegar la simulación de notas y metas académicas al servicio', async () => {
      const dto: SimulateGradeDto = {
        targetGrade: 3.5,
        hypotheticalScore: 4.0,
      };
      const mockSimResult: BaseResponseDto<SimulationResultDto> = {
        status: 200,
        message: 'Simulation calculated successfully',
        data: {
          summary: {} as any,
          targetGrade: 3.5,
          requiredForTarget: 3.0,
          isTargetAttainable: true,
          hypotheticalScore: 4.0,
          hypotheticalFinalGrade: 3.85,
          hypotheticalStatus: 'Aprobando',
        },
      };
      service.simulate.mockResolvedValue(mockSimResult);

      const res = await controller.simulate(mockUserReq, 10, dto);

      expect(service.simulate).toHaveBeenCalledWith(1, 10, dto);
      expect(res.status).toBe(200);
      expect(res.data.isTargetAttainable).toBe(true);
    });
  });
});
