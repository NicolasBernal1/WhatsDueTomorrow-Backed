import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class AddSubjectDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  professor: string;

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsInt({ message: 'The credits must be an integer number' })
  @Min(1, { message: 'The credits must be at least 1' })
  @Max(12, { message: 'The credits cannot exceed 12' })
  credits?: number;
}
