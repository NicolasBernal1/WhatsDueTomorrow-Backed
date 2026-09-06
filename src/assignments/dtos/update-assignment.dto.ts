import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reminderMinutes?: number | null;
}
