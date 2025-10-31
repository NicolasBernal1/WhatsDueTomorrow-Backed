import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Subject } from './entities/subject.entity';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { AuthGuard } from '@nestjs/passport';
import { SubjectClass } from './entities/subject-class.entity';
import { AddClassDto } from './dtos/add-class.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectService: SubjectsService){}

  @Get()
  async getSubjects(@Request() req): Promise<BaseResponseDto<Subject[]>>{
    return this.subjectService.getSubjects(req.user.sub);
  }

  @Post()
  async addSubject(@Request() req, @Body() addSubjectDto: AddSubjectDto): Promise<BaseResponseDto<null>>{
    return this.subjectService.addSubject(req.user.sub, addSubjectDto);
  }

  @Delete(':id')
  async removeSubject(@Param('id', ParseIntPipe) id: number):Promise<BaseResponseDto<null>>{
    return this.subjectService.remove(id);
  }

  // Horario

  @Get('/classes')
  async getUserClasses(@Request() req): Promise<BaseResponseDto<SubjectClass[]>>{
    return this.subjectService.getClassesByid(req.user.sub);
  }

  @Post('/classes')
  async addClass(@Request() req, @Body() addClassDto: AddClassDto): Promise<BaseResponseDto<null>>{
    return this.subjectService.addClass(req.user.sub, addClassDto);
  }

  @Delete('/classes/:id')
  async deleteClass(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<BaseResponseDto<null>>{
    return this.subjectService.removeClass(req.user.sub, id);
  }
}
