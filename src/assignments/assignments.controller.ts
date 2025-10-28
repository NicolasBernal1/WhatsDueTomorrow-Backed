import { Controller, Get, Param, ParseIntPipe, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Assignment } from './entities/assignment.entity';

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
}
