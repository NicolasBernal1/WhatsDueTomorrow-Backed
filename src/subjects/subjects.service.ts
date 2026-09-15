import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ContradictoryTimeException } from './exceptions/contradictory-time.exception';
import { EditSubjectDto } from './dtos/edit-subject.dto';
import { EditClassDto } from './dtos/edit-class.dto';
import { AcademicLoadStatus, AcademicLoadSummaryDto } from './dtos/academic-load-summary.dto';

export const MIN_BALANCED_CREDITS = 12;
export const MAX_BALANCED_CREDITS = 18;
export const AUTONOMOUS_HOURS_MULTIPLIER = 2;

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly userService: UsersService,
    @InjectRepository(SubjectClass)
    private readonly subjectClassRepository: Repository<SubjectClass>,
  ) {}

  async getSubjects(
    userId: number,
  ): Promise<BaseResponseDto<SubjectResponseDto[]>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subjects = await this.subjectRepository.findBy({
      user: { id: userId },
    });

    if (subjects.length === 0) {
      return {
        status: 200,
        message: 'The user has no subjects',
        data: [],
      };
    }

    const response: SubjectResponseDto[] = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      professor: subject.professor,
      color: subject.color,
      credits: subject.credits ?? 3,
    }));

    return {
      status: 200,
      message: 'Subjects retrieved successfully',
      data: response,
    };
  }

  private validateCredits(credits: any): void {
    const num = Number(credits);
    if (
      credits === null ||
      credits === undefined ||
      isNaN(num) ||
      !Number.isInteger(num) ||
      num < 1 ||
      num > 12
    ) {
      throw new BadRequestException('The credits must be an integer between 1 and 12');
    }
  }
  //Agrego nueva funcionalidad de buscar/filtrar asignaturas
  async searchSubjects(userId: number, query: string): Promise<BaseResponseDto<SubjectResponseDto[]>> {
  const user = await this.userService.findOneById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const term = query?.trim();

  if (!term) {
    return {
      status: 200,
      message: 'Search query is required',
      data: [],
    };
  }

  const subjects = await this.subjectRepository
    .createQueryBuilder('subject')
    .leftJoin('subject.user', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('(subject.name LIKE :term OR subject.professor LIKE :term)', {
      term: `%${term}%`,
    })
    .getMany();

  if (subjects.length === 0) {
    return {
      status: 200,
      message: 'No subjects found matching the search',
      data: [],
    };
  }

  const response: SubjectResponseDto[] = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    professor: subject.professor,
    color: subject.color,
    credits: subject.credits ?? 3,
  }));

  return {
    status: 200,
    message: 'Subjects retrieved successfully',
    data: response,
  };
}

  async getSubject(
    subjectId: number,
  ): Promise<BaseResponseDto<SubjectResponseDto>> {
    const subject = await this.getSubjectById(subjectId);

    return {
      status: 200,
      message: 'Subject rectrieved successfully',
      data: {
        id: subject.id,
        name: subject.name,
        professor: subject.professor,
        color: subject.color,
        credits: subject.credits ?? 3,
      },
    };
  }

  async addSubject(
    userId: number,
    addSubjectDto: AddSubjectDto,
  ): Promise<BaseResponseDto<null>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (addSubjectDto.credits !== undefined) {
      this.validateCredits(addSubjectDto.credits);
    }

    const newSubject = this.subjectRepository.create({
      name: addSubjectDto.name,
      professor: addSubjectDto.professor,
      color: addSubjectDto.color,
      credits: addSubjectDto.credits !== undefined ? Number(addSubjectDto.credits) : 3,
      user: user,
    });

    await this.subjectRepository.save(newSubject);

    return {
      status: 201,
      message: 'Subject created successfully',
    };
  }

  async remove(id: number): Promise<BaseResponseDto<null>> {
    const subject = await this.subjectRepository.findOneBy({ id: id });
    if (!subject) {
      throw new NotFoundException('The subject does not exist');
    }

    await this.subjectRepository.delete(id);

    return {
      status: 200,
      message: 'Subject deleted successfully',
    };
  }

  async getSubjectById(subjectId: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOneBy({ id: subjectId });
    if (!subject) {
      throw new NotFoundException('The subject does not exist');
    }
    return subject;
  }

  async getClassesByid(
    userId: number,
  ): Promise<BaseResponseDto<ClassResponseDto[]>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userClasses = await this.subjectClassRepository.findBy({
      user: { id: userId },
    });

    if (userClasses.length === 0) {
      return {
        status: 200,
        message: 'The user has no classes',
        data: [],
      };
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
        color: userClass.subject.color,
        credits: userClass.subject.credits ?? 3,
      },
    }));

    return {
      status: 200,
      message: 'Classes retrieved successfully',
      data: response,
    };
  }

  async addClass(
    userId: number,
    addClassDto: AddClassDto,
  ): Promise<BaseResponseDto<null>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    } //la comprobacion de usuario deberia estar mejor en una funcion en userService, si meda tiempo locambio luego pero ya esta en muchas partes:b

    const subject = await this.getSubjectById(addClassDto.subjectId);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (addClassDto.endTime < addClassDto.startTime) {
      console.log('ERRRRRORRRRRRRRRRRRRRRR');
      throw new ContradictoryTimeException();
    }

    const newClass = this.subjectClassRepository.create({
      dayOfWeek: addClassDto.dayOfWeek,
      startTime: addClassDto.startTime,
      endTime: addClassDto.endTime,
      subject: subject,
      user: user,
    });

    await this.subjectClassRepository.save(newClass);

    return {
      status: 201,
      message: 'Class created successfully',
    };
  }

  async removeClass(
    userId: number,
    classId: number,
  ): Promise<BaseResponseDto<null>> {
    const subjectClass = await this.subjectClassRepository.findOne({
      where: { id: classId, user: { id: userId } },
    });

    if (!subjectClass) {
      throw new NotFoundException('Class not found or not owned by user');
    }

    await this.subjectClassRepository.delete(classId);

    return {
      status: 200,
      message: 'Class deleted successfully',
    };
  }

  async editSubject(
    subjectId: number,
    editSubjectDto: EditSubjectDto,
  ): Promise<BaseResponseDto<null>> {
    if (editSubjectDto.credits !== undefined) {
      this.validateCredits(editSubjectDto.credits);
    }

    const subject = await this.subjectRepository.preload({
      id: subjectId,
      ...editSubjectDto,
      credits: editSubjectDto.credits !== undefined ? Number(editSubjectDto.credits) : undefined,
    });

    if (!subject) {
      throw new NotFoundException('The subject does not exist');
    }

    await this.subjectRepository.save(subject);

    return {
      status: 200,
      message: 'Subject updated successfully',
    };
  }

  async editClass(
    userId: number,
    classId: number,
    editClassDto: EditClassDto,
  ): Promise<BaseResponseDto<null>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subjectClass = await this.subjectClassRepository.preload({
      id: classId,
      ...editClassDto,
    });

    if (!subjectClass) {
      throw new NotFoundException('Class not found or not owned by user');
    }

    await this.subjectClassRepository.save(subjectClass);

    return {
      status: 200,
      message: 'Class updated successfully',
    };
  }

  async getAcademicLoadSummary(
    userId: number,
  ): Promise<BaseResponseDto<AcademicLoadSummaryDto>> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subjects = await this.subjectRepository.findBy({
      user: { id: userId },
    });

    const userClasses = await this.subjectClassRepository.findBy({
      user: { id: userId },
    });

    const totalCredits = subjects.reduce(
      (sum, sub) => sum + (sub.credits !== undefined && sub.credits !== null ? Number(sub.credits) : 3),
      0,
    );

    let status: AcademicLoadStatus = 'baja';
    let statusLabel = 'Carga baja';

    if (totalCredits < MIN_BALANCED_CREDITS) {
      status = 'baja';
      statusLabel = 'Carga baja';
    } else if (totalCredits <= MAX_BALANCED_CREDITS) {
      status = 'balanceada';
      statusLabel = 'Carga balanceada';
    } else {
      status = 'sobrecarga';
      statusLabel = 'Sobrecarga';
    }

    let totalPresentialMinutes = 0;
    for (const cls of userClasses) {
      if (cls.startTime && cls.endTime) {
        const [startH, startM = 0] = cls.startTime.split(':').map(Number);
        const [endH, endM = 0] = cls.endTime.split(':').map(Number);
        const startTotal = startH * 60 + (startM || 0);
        const endTotal = endH * 60 + (endM || 0);
        const duration = Math.max(0, endTotal - startTotal);
        totalPresentialMinutes += duration;
      }
    }

    const weeklyPresentialHours = Math.round((totalPresentialMinutes / 60 + Number.EPSILON) * 100) / 100;
    const weeklyAutonomousHours = Math.round((weeklyPresentialHours * AUTONOMOUS_HOURS_MULTIPLIER + Number.EPSILON) * 100) / 100;

    return {
      status: 200,
      message: 'Academic load summary calculated successfully',
      data: {
        totalCredits,
        status,
        statusLabel,
        weeklyPresentialHours,
        weeklyAutonomousHours,
        subjectsCount: subjects.length,
        classesCount: userClasses.length,
      },
    };
  }
}
