import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject } from './entities/subject.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Subject]),
      UsersModule
    ],
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService]
})
export class SubjectsModule {}
