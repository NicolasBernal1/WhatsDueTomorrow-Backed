export type AcademicLoadStatus = 'baja' | 'balanceada' | 'sobrecarga';

export class AcademicLoadSummaryDto {
  totalCredits: number;
  status: AcademicLoadStatus;
  statusLabel: string;
  weeklyPresentialHours: number;
  weeklyAutonomousHours: number;
  subjectsCount: number;
  classesCount: number;
}
