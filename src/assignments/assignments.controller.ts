import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Assignment } from './entities/assignment.entity';
import { AddAssignmentDto } from './dtos/add-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentService: AssignmentsService){}

  @Get('subject/:subjectId')
  async getAssignmentsBySubject(@Request() req, @Param('subjectId', ParseIntPipe) subjectId: number): Promise<BaseResponseDto<Assignment[]>>{
    return this.assignmentService.getAssignmentsBySubject(req.user.sub, subjectId);
  }

  @Get()
  async getAll(@Request() req): Promise<BaseResponseDto<Assignment[]>>{
    return this.assignmentService.getAssignmentsByUser(req.user.sub);
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
