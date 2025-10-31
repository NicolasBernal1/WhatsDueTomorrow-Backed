import { IsNotEmpty } from "class-validator";

export class AddClassDto {
  @IsNotEmpty()
  dayOfWeek: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  subjectId: number;
}