import { IsNotEmpty } from "class-validator";
import { SubjectResponseDto } from "./subject-response.dto";

export class ClassResponseDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  dayOfWeek: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  subject: SubjectResponseDto;
}