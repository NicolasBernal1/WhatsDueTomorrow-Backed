import { SubtaskResponseDto } from './subtask-response.dto';

export class SubtaskListResponseDto {
  subtasks: SubtaskResponseDto[];
  progress: number;
}
