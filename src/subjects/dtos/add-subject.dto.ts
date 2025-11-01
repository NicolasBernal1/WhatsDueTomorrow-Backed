import { IsNotEmpty, IsOptional } from "class-validator";

export class AddSubjectDto{
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  professor: string;

  @IsOptional()
  color?: string; 
}