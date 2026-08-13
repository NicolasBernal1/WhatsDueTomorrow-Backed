import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateAssignmentDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  dueDate?: string;
}