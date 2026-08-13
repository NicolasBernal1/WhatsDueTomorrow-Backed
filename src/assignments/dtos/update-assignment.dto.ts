import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateAssignmentDto {
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  dueDate?: string;
}