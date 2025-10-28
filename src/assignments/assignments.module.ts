import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { UsersModule } from 'src/users/users.module';
import { SubjectsModule } from 'src/subjects/subjects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    UsersModule,
    SubjectsModule
  ],
  providers: [AssignmentsService],
  controllers: [AssignmentsController],
  exports: [AssignmentsService]
})
export class AssignmentsModule {}
