import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { AddAssignmentDto } from './dtos/add-assignment.dto';
import { AuthGuard } from '@nestjs/passport';
import { AssignmentResponseDto } from './dtos/assignment-response.dto';
import { AssignmentResponseCompDto } from './dtos/assignment-response-comp.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentService: AssignmentsService){}

  @Get()
  async getAll(@Request() req): Promise<BaseResponseDto<AssignmentResponseCompDto[]>>{
    return this.assignmentService.getAssignmentsByUser(req.user.sub);
  }

  @Get('subject/:subjectId')
  async getAssignmentsBySubject(@Request() req, @Param('subjectId', ParseIntPipe) subjectId: number): Promise<BaseResponseDto<AssignmentResponseDto[]>>{
    return this.assignmentService.getAssignmentsBySubject(req.user.sub, subjectId);
  }

  @Post('subject/:subjectId')
  async addAssignment(@Request() req, @Param('subjectId', ParseIntPipe) subjectId: number, @Body() addAssignmentDto: AddAssignmentDto): Promise<BaseResponseDto<null>>{
    return this.assignmentService.addAssignment(req.user.sub, subjectId, addAssignmentDto);
  }

  @Delete('/:assignmentId')
  async removeAssignment(@Param('assignmentId', ParseIntPipe) assignmentId: number): Promise<BaseResponseDto<null>>{
    return this.assignmentService.deleteAssignment(assignmentId);
  }

}
