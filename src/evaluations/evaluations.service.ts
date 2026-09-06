import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { EvaluationListResponseDto } from './dtos/evaluation-list-response.dto';
import { ApprovalStatus, GradeSummaryDto } from './dtos/grade-summary.dto';
import {
  SimulateGradeDto,
  SimulationResultDto,
} from './dtos/simulate-grade.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { Evaluation } from './entities/evaluation.entity';

const PASSING_GRADE = 3.0;
const MAX_GRADE = 5.0;

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getBySubject(
    userId: number,
    subjectId: number,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    await this.getOwnedSubject(userId, subjectId);
    const evaluations = await this.evaluationRepository.find({
      where: { subject: { id: subjectId } },
      order: { id: 'ASC' },
    });

    return {
      status: 200,
      message: 'Evaluations retrieved successfully',
      data: this.buildListResponse(evaluations, subjectId),
    };
  }

  async create(
    userId: number,
    subjectId: number,
    dto: CreateEvaluationDto,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    const subject = await this.getOwnedSubject(userId, subjectId);

    const name = dto.name ? dto.name.trim() : '';
    if (!name) {
      throw new BadRequestException('The evaluation name cannot be empty');
    }

    if (dto.weight < 1 || dto.weight > 100) {
      throw new BadRequestException(
        'The weight percentage must be between 1 and 100',
      );
    }

    if (dto.score < 0 || dto.score > 5) {
      throw new BadRequestException('The score must be between 0.0 and 5.0');
    }

    const evaluation = this.evaluationRepository.create({
      name,
      weight: round2(dto.weight),
      score: round2(dto.score),
      subject,
    });

    await this.evaluationRepository.save(evaluation);
    return this.getBySubject(userId, subjectId);
  }

  async update(
    userId: number,
    subjectId: number,
    evaluationId: number,
    dto: UpdateEvaluationDto,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    const evaluation = await this.getOwnedEvaluation(
      userId,
      subjectId,
      evaluationId,
    );

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('The evaluation name cannot be empty');
      }
      evaluation.name = trimmedName;
    }

    if (dto.weight !== undefined) {
      if (dto.weight < 1 || dto.weight > 100) {
        throw new BadRequestException(
          'The weight percentage must be between 1 and 100',
        );
      }
      evaluation.weight = round2(dto.weight);
    }

    if (dto.score !== undefined) {
      if (dto.score < 0 || dto.score > 5) {
        throw new BadRequestException('The score must be between 0.0 and 5.0');
      }
      evaluation.score = round2(dto.score);
    }

    await this.evaluationRepository.save(evaluation);
    return this.getBySubject(userId, subjectId);
  }

  async remove(
    userId: number,
    subjectId: number,
    evaluationId: number,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    const evaluation = await this.getOwnedEvaluation(
      userId,
      subjectId,
      evaluationId,
    );
    await this.evaluationRepository.remove(evaluation);
    return this.getBySubject(userId, subjectId);
  }

  async simulate(
    userId: number,
    subjectId: number,
    dto: SimulateGradeDto,
  ): Promise<BaseResponseDto<SimulationResultDto>> {
    const listRes = await this.getBySubject(userId, subjectId);
    if (!listRes.data) {
      throw new NotFoundException('Evaluations could not be retrieved');
    }
    const summary = listRes.data.summary;

    const targetGrade =
      dto.targetGrade !== undefined ? round2(dto.targetGrade) : PASSING_GRADE;

    let requiredForTarget: number | null = null;
    let isTargetAttainable = false;

    if (summary.remainingWeight > 0) {
      if (summary.currentContribution >= targetGrade) {
        requiredForTarget = 0.0;
        isTargetAttainable = true;
      } else {
        const rawRequired =
          ((targetGrade - summary.currentContribution) * 100) /
          summary.remainingWeight;
        requiredForTarget = round2(rawRequired);
        isTargetAttainable = requiredForTarget <= MAX_GRADE;
      }
    }

    let hypotheticalFinalGrade: number | null = null;
    let hypotheticalStatus: ApprovalStatus | null = null;

    if (dto.hypotheticalScore !== undefined && summary.remainingWeight > 0) {
      const hyp = round2(dto.hypotheticalScore);
      const simulatedContribution =
        summary.currentContribution + (hyp * summary.remainingWeight) / 100;
      hypotheticalFinalGrade = round2(simulatedContribution);
      hypotheticalStatus =
        hypotheticalFinalGrade >= PASSING_GRADE ? 'Aprobando' : 'En riesgo';
    }

    return {
      status: 200,
      message: 'Simulation calculated successfully',
      data: {
        summary,
        targetGrade,
        requiredForTarget,
        isTargetAttainable,
        hypotheticalScore: dto.hypotheticalScore ?? null,
        hypotheticalFinalGrade,
        hypotheticalStatus,
      },
    };
  }

  calculateSummary(evaluations: Evaluation[]): GradeSummaryDto {
    let totalWeight = 0;
    let currentContribution = 0;

    for (const ev of evaluations) {
      const weight = Number(ev.weight);
      const score = Number(ev.score);
      totalWeight += weight;
      currentContribution += (score * weight) / 100;
    }

    totalWeight = round2(totalWeight);
    currentContribution = round2(currentContribution);

    const remainingWeight = round2(100 - totalWeight);
    const weightExceeded = totalWeight > 100;

    const currentAverage =
      totalWeight > 0 ? round2((currentContribution * 100) / totalWeight) : 0;

    let requiredGrade: number | null = null;
    let isAttainable = true;

    if (evaluations.length === 0) {
      requiredGrade = PASSING_GRADE;
      isAttainable = true;
    } else if (currentContribution >= PASSING_GRADE) {
      requiredGrade = 0.0;
      isAttainable = true;
    } else if (remainingWeight <= 0) {
      requiredGrade = null;
      isAttainable = false;
    } else {
      const rawRequired =
        ((PASSING_GRADE - currentContribution) * 100) / remainingWeight;
      requiredGrade = round2(rawRequired);
      isAttainable = requiredGrade <= MAX_GRADE;
    }

    let status: ApprovalStatus = 'Sin calificaciones';

    if (evaluations.length > 0) {
      if (currentContribution >= PASSING_GRADE) {
        status = 'Aprobado';
      } else if (isAttainable && currentAverage >= PASSING_GRADE) {
        status = 'Aprobando';
      } else {
        status = 'En riesgo';
      }
    }

    const isPassing =
      evaluations.length > 0 &&
      (currentContribution >= PASSING_GRADE ||
        (currentAverage >= PASSING_GRADE && isAttainable));

    return {
      totalWeight,
      remainingWeight,
      currentContribution,
      currentAverage,
      requiredGrade,
      isPassing,
      isAttainable,
      status,
      weightExceeded,
      passingGrade: PASSING_GRADE,
      maxGrade: MAX_GRADE,
    };
  }

  private buildListResponse(
    evaluations: Evaluation[],
    subjectId: number,
  ): EvaluationListResponseDto {
    return {
      evaluations: evaluations.map((ev) => ({
        id: ev.id,
        name: ev.name,
        weight: Number(ev.weight),
        score: Number(ev.score),
        createdAt: ev.createdAt,
        updatedAt: ev.updatedAt,
        subjectId,
      })),
      summary: this.calculateSummary(evaluations),
    };
  }

  private async getOwnedSubject(
    userId: number,
    subjectId: number,
  ): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: { user: true },
    });
    if (!subject) {
      throw new NotFoundException('The subject does not exist');
    }
    if (subject.user?.id !== userId) {
      throw new ForbiddenException('You cannot access this subject');
    }
    return subject;
  }

  private async getOwnedEvaluation(
    userId: number,
    subjectId: number,
    evaluationId: number,
  ): Promise<Evaluation> {
    await this.getOwnedSubject(userId, subjectId);
    const evaluation = await this.evaluationRepository.findOne({
      where: { id: evaluationId, subject: { id: subjectId } },
      relations: { subject: true },
    });
    if (!evaluation) {
      throw new NotFoundException('The evaluation does not exist');
    }
    return evaluation;
  }
}
