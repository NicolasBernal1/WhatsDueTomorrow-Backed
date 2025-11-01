import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { AddAssignmentDto } from './dtos/add-assignment.dto';
import { UsersService } from 'src/users/users.service';
import { SubjectsService } from 'src/subjects/subjects.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private readonly userService: UsersService,
    private readonly subjectService: SubjectsService
  ){}

  async getAssignmentsBySubject(userId: number, subjectId: number): Promise<BaseResponseDto<Assignment[]>>{
    const assignments = await this.assignmentRepository.find({
      where: { user: { id: userId }, subject: { id: subjectId } },
    });

    if(assignments.length === 0){
      return {
        status: 200,
        message: 'No assignments found for this subject',
          data: []
      };
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
      return {
        status: 200,
        message: 'No assignments found for this user',
          data: []
      };
    }

    return {
      status: 200,
      message: 'Assignments retrieved successfully',
      data: assignments
    }
  }

  async addAssignment(userId: number, subjectId: number, addAssignmentDto: AddAssignmentDto): Promise<BaseResponseDto<null>>{
    const user = await this.userService.findOneById(userId);
    const subject = await this.subjectService.getSubjectById(subjectId);

    if(!user){
      throw new NotFoundException('The user does not exist');
    }

    if(!subject){
      throw new NotFoundException('The subject does not exist');
    }

    const newAssignment = this.assignmentRepository.create({
      title: addAssignmentDto.title,
      description: addAssignmentDto.description,
      dueDate: addAssignmentDto.dueDate,
      user: user,
      subject: subject
    });

    await this.assignmentRepository.save(newAssignment);

    return {
      status: 201,
      message: 'Assignment created successfully'
    }
  }

  async deleteAssignment(assignmentId: number): Promise<BaseResponseDto<null>>{
    const assignment = await this.assignmentRepository.findOneBy({ id: assignmentId });

    if(!assignment){
      throw new NotFoundException('The assignment does not exist');
    }

    await this.assignmentRepository.delete(assignmentId);

    return {
      status: 200,
      message: 'Assignment deleted successfully'
    }
  }
}
