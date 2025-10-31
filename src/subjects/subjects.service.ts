import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { UsersService } from 'src/users/users.service';
import { SubjectClass } from './entities/subject-class.entity';
import { AddClassDto } from './dtos/add-class.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly userService: UsersService,
    @InjectRepository(SubjectClass)
    private readonly subjectClassRepository: Repository<SubjectClass>
  ){}

  async getSubjects(userId: number): Promise<BaseResponseDto<Subject[]>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const subjects = await this.subjectRepository.findBy({ user: { id: userId } });

    if(subjects.length === 0){
      return {
        status: 200,
        message: "The user has no subjects",
        data: subjects
      }
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

  async getSubjectById(subjectId: number): Promise<Subject | null>{
    return await this.subjectRepository.findOneBy({ id: subjectId });
  }

  async getClassesByid(userId: number): Promise<BaseResponseDto<SubjectClass[]>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const userClasses = await this.subjectClassRepository.findBy({ user: { id: userId } });

    if(userClasses.length === 0){
      return {
        status: 200,
        message: "The user has no classes",
        data: userClasses
      }
    }

    return {
      status: 200,
      message: "Classes retrieved successfully",
      data: userClasses
    }
  }

  async addClass(userId: number, addClassDto: AddClassDto): Promise<BaseResponseDto<null>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    } //la comprobacion de usuario deberia estar mejor en una funcion en userService, si meda tiempo locambio luego pero ya esta en muchas partes:b
    
    const subject = await this.getSubjectById(addClassDto.subjectId);

    if(!subject){
      throw new NotFoundException('Subject not found');
    }

    const newClass = this.subjectClassRepository.create({
      dayOfWeek: addClassDto.dayOfWeek,
      startTime: addClassDto.startTime,
      endTime: addClassDto.endTime,
      subject: subject,
      user: user
    });

    await this.subjectClassRepository.save(newClass);

    return {
      status: 201,
      message: 'Class created successfully'
    }
  }

  async removeClass(userId: number, classId: number): Promise<BaseResponseDto<null>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const subjectClass = await this.subjectClassRepository.findOneBy({ id: classId });

    if(!subjectClass){
      throw new NotFoundException('Class not found');
    }

    await this.subjectClassRepository.delete(classId);

    return {
      status: 200,
      message: 'Class deleted successfully'
    }

    
  }
}
