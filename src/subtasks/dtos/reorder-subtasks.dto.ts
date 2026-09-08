import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReorderSubtasksDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  orderedIds: number[];
}
