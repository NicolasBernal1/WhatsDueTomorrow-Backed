import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class AddAssignmentDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  dueDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reminderMinutes?: number | null;
}
