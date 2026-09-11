import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { SubjectClass } from 'src/subjects/entities/subject-class.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CalendarFeed } from './entities/calendar-feed.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarFeed)
    private readonly feedRepository: Repository<CalendarFeed>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(SubjectClass)
    private readonly classRepository: Repository<SubjectClass>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async getOrCreateToken(userId: number): Promise<string> {
    const existingFeed = await this.feedRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingFeed) return existingFeed.token;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const feed = this.feedRepository.create({
      user,
      token: randomBytes(32).toString('hex'),
    });
    return (await this.feedRepository.save(feed)).token;
  }

  async generateForUser(userId: number): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const [classes, assignments] = await Promise.all([
      this.classRepository.find({ where: { user: { id: userId } } }),
      this.assignmentRepository.find({ where: { user: { id: userId } } }),
    ]);

    return this.buildCalendar(user.id, classes, assignments);
  }

  async generateForToken(token: string): Promise<string> {
    const feed = await this.feedRepository.findOne({ where: { token } });
    if (!feed) throw new NotFoundException('Calendar feed not found');
    return this.generateForUser(feed.user.id);
  }

  private buildCalendar(
    userId: number,
    classes: SubjectClass[],
    assignments: Assignment[],
  ): string {
    const events = [
      ...classes.map((item) => this.classEvent(userId, item)),
      ...assignments.map((item) => this.assignmentEvent(userId, item)),
    ];
    return (
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Whats Due Tomorrow//Academic Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...events,
        'END:VCALENDAR',
      ].join('\r\n') + '\r\n'
    );
  }

  private classEvent(userId: number, subjectClass: SubjectClass): string[] {
    const startDate = this.nextWeekdayDate(subjectClass.dayOfWeek);
    return [
      'BEGIN:VEVENT',
      `UID:class-${subjectClass.id}-user-${userId}@whats-due-tomorrow`,
      `DTSTAMP:${this.toUtcIcs(new Date())}`,
      `DTSTART:${this.toFloatingIcs(startDate, subjectClass.startTime)}`,
      `DTEND:${this.toFloatingIcs(startDate, subjectClass.endTime)}`,
      'RRULE:FREQ=WEEKLY',
      this.fold(
        `SUMMARY:${this.escape(`Class: ${subjectClass.subject.name}`)}`,
      ),
      this.fold(
        `DESCRIPTION:${this.escape(`Professor: ${subjectClass.subject.professor}`)}`,
      ),
      'END:VEVENT',
    ];
  }

  private assignmentEvent(userId: number, assignment: Assignment): string[] {
    const dueDate = new Date(assignment.dueDate);
    return [
      'BEGIN:VEVENT',
      `UID:assignment-${assignment.id}-user-${userId}@whats-due-tomorrow`,
      `DTSTAMP:${this.toUtcIcs(new Date())}`,
      `DTSTART:${this.toUtcIcs(dueDate)}`,
      this.fold(`SUMMARY:${this.escape(`Due: ${assignment.title}`)}`),
      this.fold(
        `DESCRIPTION:${this.escape(`Subject: ${assignment.subject.name}${assignment.description ? `\\n${assignment.description}` : ''}`)}`,
      ),
      'END:VEVENT',
    ];
  }

  private nextWeekdayDate(day: string): Date {
    const weekdays: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      domingo: 0,
      lunes: 1,
      martes: 2,
      miércoles: 3,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sábado: 6,
      sabado: 6,
    };
    const target = weekdays[day.toLowerCase()] ?? 1;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + ((target - date.getDay() + 7) % 7));
    return date;
  }

  private toFloatingIcs(date: Date, time: string): string {
    const [hours, minutes, seconds = '0'] = time.split(':');
    return `${date.getFullYear()}${this.pad(date.getMonth() + 1)}${this.pad(date.getDate())}T${this.pad(Number(hours))}${this.pad(Number(minutes))}${this.pad(Number(seconds))}`;
  }

  private toUtcIcs(date: Date): string {
    return `${date.getUTCFullYear()}${this.pad(date.getUTCMonth() + 1)}${this.pad(date.getUTCDate())}T${this.pad(date.getUTCHours())}${this.pad(date.getUTCMinutes())}${this.pad(date.getUTCSeconds())}Z`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
  private escape(value: string): string {
    return value
      .replaceAll(/\\/g, '\\\\')
      .replaceAll(/;/g, '\\;')
      .replaceAll(/,/g, '\\,')
      .replaceAll(/\r?\n/g, '\\n');
  }
  /** RFC 5545 content lines must be folded at 75 octets or fewer. */
  private fold(line: string): string {
    if (line.length <= 75) return line;
    const parts = [line.slice(0, 75)];
    let remaining = line.slice(75);
    while (remaining.length) {
      parts.push(` ${remaining.slice(0, 74)}`);
      remaining = remaining.slice(74);
    }
    return parts.join('\r\n');
  }
}
