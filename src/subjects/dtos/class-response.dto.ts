import { IsNotEmpty } from "class-validator";

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
  subjectId: number;
}