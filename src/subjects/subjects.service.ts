import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly userService: UsersService
  ){}

  async getSubjects(userId: number): Promise<BaseResponseDto<Subject[]>>{
    const subjects = await this.subjectRepository.findBy({ user: { id: userId } });

    if(subjects.length === 0){
      throw new NotFoundException('The user has no subjects or does not exist');
    }

    return {
      status: 200,
      message: "Subjects retrieved successfully",
      data: subjects
    }
  }

  async addSubject(userId: number, addSubjectDto: AddSubjectDto): Promise<BaseResponseDto<null>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const newSubject = this.subjectRepository.create({
      name: addSubjectDto.name,
      professor: addSubjectDto.professor,
      color: addSubjectDto.color,
      user: user
    });

    await this.subjectRepository.save(newSubject);

    return {
      status: 201,
      message: "Subject created successfully"
    }
  }

  async remove(id: number):Promise<BaseResponseDto<null>>{
    const subject = await this.subjectRepository.findOneBy({ id: id });
    if(!subject){
      throw new NotFoundException("The subject does not exist");
    }

    await this.subjectRepository.delete(id);

    return {
      status: 200,
      message: "Subject deleted successfully"
    }
  }
}
