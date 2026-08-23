import { IsString } from 'class-validator';

export class EditClassDto {
  @IsString()
  dayOfWeek!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;
}