import { IsNotEmpty } from "class-validator";

export class SubjectResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  professor: string;

  @IsNotEmpty()
  color: string;
}