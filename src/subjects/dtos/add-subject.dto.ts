import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class AddSubjectDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  professor: string;

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  credits?: number;
}
