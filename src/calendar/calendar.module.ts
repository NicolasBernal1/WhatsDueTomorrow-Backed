import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { CalendarController } from './calendar.controller';
import { CalendarFeed } from './entities/calendar-feed.entity';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarFeed, User, SubjectClass, Assignment]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
