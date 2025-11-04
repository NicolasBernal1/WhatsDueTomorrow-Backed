import { IsNotEmpty, IsOptional } from "class-validator";

export class AssignmentResponseCompDto {
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

  @IsNotEmpty()
  subjectName: string;
}