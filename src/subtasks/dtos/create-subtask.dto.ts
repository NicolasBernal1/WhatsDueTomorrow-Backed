import { IsNotEmpty } from 'class-validator';

export class CreateSubtaskDto {
  @IsNotEmpty()
  title: string;
}
