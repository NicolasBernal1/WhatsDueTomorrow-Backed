import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class EditSubjectDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  professor?: string;

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  credits?: number;
}
