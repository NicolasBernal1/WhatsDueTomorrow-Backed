import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { UsersService } from 'src/users/users.service';
import { SubjectClass } from './entities/subject-class.entity';
import { AddClassDto } from './dtos/add-class.dto';
import { SubjectResponseDto } from './dtos/subject-response.dto';
import { ClassResponseDto } from './dtos/class-response.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly userService: UsersService,
    @InjectRepository(SubjectClass)
    private readonly subjectClassRepository: Repository<SubjectClass>
  ){}

  async getSubjects(userId: number): Promise<BaseResponseDto<SubjectResponseDto[]>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const subjects = await this.subjectRepository.findBy({ user: { id: userId } });

    if(subjects.length === 0){
      return {
        status: 200,
        message: "The user has no subjects",
        data: []
      }
    }

    const response: SubjectResponseDto[] = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      professor: subject.professor,
      color: subject.color
    }));

    return {
      status: 200,
      message: "Subjects retrieved successfully",
      data: response
    }
  }

  async getSubject(subjectId: number): Promise<BaseResponseDto<SubjectResponseDto>>{
    const subject = await this.getSubjectById(subjectId);

    if(!subject){
      throw new NotFoundException('Subject not found');
    }

    return {
      status: 200,
      message: 'Subject rectrieved successfully',
      data: {
        id: subject.id,
        name: subject.name,
        professor: subject.professor,
        color: subject.color
      }
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

  async getSubjectById(subjectId: number): Promise<Subject>{
    const subject = await this.subjectRepository.findOneBy({ id: subjectId });
    if(!subject){
      throw new NotFoundException('The subject does not exist');
    }
    return subject;
  }

  async getClassesByid(userId: number): Promise<BaseResponseDto<ClassResponseDto[]>>{
    const user = await this.userService.findOneById(userId);

    if(!user){
      throw new NotFoundException('User not found');
    }

    const userClasses = await this.subjectClassRepository.findBy({ user: { id: userId } });

    if(userClasses.length === 0){
      return {
        status: 200,
        message: "The user has no classes",
        data: []
      }
    }

    const response: ClassResponseDto[] = userClasses.map((userClass) => ({
      id: userClass.id,
      dayOfWeek: userClass.dayOfWeek,
      startTime: userClass.startTime,
      endTime: userClass.endTime,
      subject: {
        id: userClass.subject.id,
        name: userClass.subject.name,
        professor: userClass.subject.professor,
        color: userClass.subject.color
      }
    }));

    return {
      status: 200,
      message: "Classes retrieved successfully",
      data: response
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
  const subjectClass = await this.subjectClassRepository.findOne({ where: { id: classId, user: { id: userId } } });

  if (!subjectClass) {
    throw new NotFoundException('Class not found or not owned by user');
  }

    await this.subjectClassRepository.delete(classId);

    return {
      status: 200,
      message: 'Class deleted successfully'
    }
  }
}
