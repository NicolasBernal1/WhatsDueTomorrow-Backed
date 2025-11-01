import { IsNotEmpty, IsOptional } from "class-validator";

export class AddAssignmentDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  dueDate: string;
}