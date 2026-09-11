import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Repository } from 'typeorm';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { ReorderSubtasksDto } from './dtos/reorder-subtasks.dto';
import { SubtaskListResponseDto } from './dtos/subtask-list-response.dto';
import { SubtaskResponseDto } from './dtos/subtask-response.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { Subtask } from './entities/subtask.entity';

@Injectable()
export class SubtasksService {
  constructor(
    @InjectRepository(Subtask)
    private readonly subtaskRepository: Repository<Subtask>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async getByAssignment(
    userId: number,
    assignmentId: number,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    await this.getOwnedAssignment(userId, assignmentId);
    const subtasks = await this.subtaskRepository.find({
      where: { assignment: { id: assignmentId } },
      order: { position: 'ASC', id: 'ASC' },
    });
    return {
      status: 200,
      message: 'Subtasks retrieved successfully',
      data: this.toListResponse(subtasks),
    };
  }

  async create(
    userId: number,
    assignmentId: number,
    dto: CreateSubtaskDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    const assignment = await this.getOwnedAssignment(userId, assignmentId);
    if (!dto.title.trim())
      throw new BadRequestException('The subtask title cannot be empty');
    const position = await this.subtaskRepository.count({
      where: { assignment: { id: assignmentId } },
    });
    await this.subtaskRepository.save(
      this.subtaskRepository.create({
        title: dto.title.trim(),
        position,
        assignment,
      }),
    );
    return this.getByAssignment(userId, assignmentId);
  }

  async update(
    userId: number,
    assignmentId: number,
    subtaskId: number,
    dto: UpdateSubtaskDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    const subtask = await this.getOwnedSubtask(userId, assignmentId, subtaskId);
    if (dto.title !== undefined) {
      if (!dto.title.trim())
        throw new BadRequestException('The subtask title cannot be empty');
      subtask.title = dto.title.trim();
    }
    if (dto.completed !== undefined) subtask.completed = dto.completed;
    await this.subtaskRepository.save(subtask);
    return this.getByAssignment(userId, assignmentId);
  }

  async remove(
    userId: number,
    assignmentId: number,
    subtaskId: number,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    const subtask = await this.getOwnedSubtask(userId, assignmentId, subtaskId);
    await this.subtaskRepository.remove(subtask);
    const remaining = await this.subtaskRepository.find({
      where: { assignment: { id: assignmentId } },
      order: { position: 'ASC', id: 'ASC' },
    });
    await Promise.all(
      remaining.map((item, index) =>
        this.subtaskRepository.update(item.id, { position: index }),
      ),
    );
    return this.getByAssignment(userId, assignmentId);
  }

  async reorder(
    userId: number,
    assignmentId: number,
    dto: ReorderSubtasksDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    await this.getOwnedAssignment(userId, assignmentId);
    const subtasks = await this.subtaskRepository.find({
      where: { assignment: { id: assignmentId } },
    });
    const currentIds = subtasks.map((item) => item.id).sort((a, b) => a - b);
    const orderedIds = [...dto.orderedIds].sort((a, b) => a - b);
    if (
      currentIds.length !== orderedIds.length ||
      currentIds.some((id, index) => id !== orderedIds[index])
    ) {
      throw new ForbiddenException(
        'The subtask order must belong to this assignment',
      );
    }
    await Promise.all(
      dto.orderedIds.map((id, position) =>
        this.subtaskRepository.update(id, { position }),
      ),
    );
    return this.getByAssignment(userId, assignmentId);
  }

  private async getOwnedAssignment(
    userId: number,
    assignmentId: number,
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: { user: true },
    });
    if (!assignment)
      throw new NotFoundException('The assignment does not exist');
    if (assignment.user.id !== userId)
      throw new ForbiddenException('You cannot access this assignment');
    return assignment;
  }

  private async getOwnedSubtask(
    userId: number,
    assignmentId: number,
    subtaskId: number,
  ): Promise<Subtask> {
    await this.getOwnedAssignment(userId, assignmentId);
    const subtask = await this.subtaskRepository.findOne({
      where: { id: subtaskId, assignment: { id: assignmentId } },
    });
    if (!subtask) throw new NotFoundException('The subtask does not exist');
    return subtask;
  }

  private toListResponse(subtasks: Subtask[]): SubtaskListResponseDto {
    const completed = subtasks.filter((subtask) => subtask.completed).length;
    return {
      subtasks: subtasks.map(
        (subtask): SubtaskResponseDto => ({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed,
          position: subtask.position,
        }),
      ),
      progress: subtasks.length
        ? Math.round((completed / subtasks.length) * 100)
        : 0,
    };
  }
}
