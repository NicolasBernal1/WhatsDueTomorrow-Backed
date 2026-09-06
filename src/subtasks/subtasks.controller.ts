import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { ReorderSubtasksDto } from './dtos/reorder-subtasks.dto';
import { SubtaskListResponseDto } from './dtos/subtask-list-response.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { SubtasksService } from './subtasks.service';

@UseGuards(AuthGuard('jwt'))
@Controller('assignments/:assignmentId/subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Get()
  getAll(
    @Request() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    return this.subtasksService.getByAssignment(req.user.sub, assignmentId);
  }

  @Post()
  create(
    @Request() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() dto: CreateSubtaskDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    return this.subtasksService.create(req.user.sub, assignmentId, dto);
  }

  @Patch('order')
  reorder(
    @Request() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() dto: ReorderSubtasksDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    return this.subtasksService.reorder(req.user.sub, assignmentId, dto);
  }

  @Patch(':subtaskId')
  update(
    @Request() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('subtaskId', ParseIntPipe) subtaskId: number,
    @Body() dto: UpdateSubtaskDto,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    return this.subtasksService.update(
      req.user.sub,
      assignmentId,
      subtaskId,
      dto,
    );
  }

  @Delete(':subtaskId')
  remove(
    @Request() req,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('subtaskId', ParseIntPipe) subtaskId: number,
  ): Promise<BaseResponseDto<SubtaskListResponseDto>> {
    return this.subtasksService.remove(req.user.sub, assignmentId, subtaskId);
  }
}
