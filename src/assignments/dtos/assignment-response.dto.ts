import { IsNotEmpty, IsOptional } from "class-validator";

export class AssignmentResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  dueDate: string;

  @IsNotEmpty()
  subjectId: number;
}