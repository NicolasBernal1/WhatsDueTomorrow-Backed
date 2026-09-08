export type ApprovalStatus =
  | 'Aprobando'
  | 'En riesgo'
  | 'Aprobado'
  | 'Sin calificaciones';

export class GradeSummaryDto {
  totalWeight: number;
  remainingWeight: number;
  currentContribution: number;
  currentAverage: number;
  requiredGrade: number | null;
  isPassing: boolean;
  isAttainable: boolean;
  status: ApprovalStatus;
  weightExceeded: boolean;
  passingGrade: number;
  maxGrade: number;
}
