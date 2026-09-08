import { EvaluationResponseDto } from './evaluation-response.dto';
import { GradeSummaryDto } from './grade-summary.dto';

export class EvaluationListResponseDto {
  evaluations: EvaluationResponseDto[];
  summary: GradeSummaryDto;
}
