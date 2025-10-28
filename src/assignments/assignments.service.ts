import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>
  ){}

  async getAssignmentsBySubject(userId: number, subjectId: number): Promise<BaseResponseDto<Assignment[]>>{
    const assignments = await this.assignmentRepository.find({
      where: { user: { id: userId }, subject: { id: subjectId } },
    });

    if(assignments.length === 0){
      throw new NotFoundException('The subject has no assignments or does not exist');
    }

    return {
      status: 200,
      message: 'Assignments retrieved successfully',
      data: assignments
    }
  }

  async getAssignmentsByUser(userId: number): Promise<BaseResponseDto<Assignment[]>>{
    const assignments = await this.assignmentRepository.find({
      where: { user: { id: userId } },
    });

    if(assignments.length === 0){
      throw new NotFoundException('The user has no assignments or does not exist');
    }

    return {
      status: 200,
      message: 'Assignments retrieved successfully',
      data: assignments
    }
  }
}
