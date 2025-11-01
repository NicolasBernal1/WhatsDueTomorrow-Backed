import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './entities/subject.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SubjectClass } from './entities/subject-class.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Subject]),
      TypeOrmModule.forFeature([SubjectClass]),
      UsersModule
    ],
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService]
})
export class SubjectsModule {}
