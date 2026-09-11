import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApprovalStatus, GradeSummaryDto } from './grade-summary.dto';

export class SimulateGradeDto {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'La calificación objetivo debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'La calificación objetivo mínima es 0.0' })
  @Max(5, { message: 'La calificación objetivo máxima es 5.0' })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : undefined,
  )
  targetGrade?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'La calificación hipotética debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'La calificación hipotética mínima es 0.0' })
  @Max(5, { message: 'La calificación hipotética máxima es 5.0' })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined && value !== null ? Number(value) : undefined,
  )
  hypotheticalScore?: number;
}

export interface SimulationResultDto {
  summary: GradeSummaryDto;
  targetGrade: number;
  requiredForTarget: number | null;
  isTargetAttainable: boolean;
  hypotheticalScore: number | null;
  hypotheticalFinalGrade: number | null;
  hypotheticalStatus: ApprovalStatus | null;
}
