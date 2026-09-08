import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Subtask } from './entities/subtask.entity';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subtask, Assignment])],
  controllers: [SubtasksController],
  providers: [SubtasksService],
})
export class SubtasksModule {}
