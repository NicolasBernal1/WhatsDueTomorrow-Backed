import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { EmailService } from 'src/email/email.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

const BOGOTA_UTC_OFFSET_HOURS = 5;

/**
 * "Tomorrow" is computed in America/Bogota's fixed UTC-5 offset (no DST),
 * then converted back to UTC ISO strings for the dueDate range query —
 * matching how the rest of this codebase compares dueDate with plain
 * ISO strings (see AssignmentsService.getUpcomingAssignments).
 */
export function getBogotaTomorrowRange(now: Date = new Date()): { start: string; end: string } {
  const bogotaNow = new Date(now.getTime() - BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  const bogotaTomorrowStartUtc = Date.UTC(
    bogotaNow.getUTCFullYear(),
    bogotaNow.getUTCMonth(),
    bogotaNow.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );
  const bogotaTomorrowEndUtc = bogotaTomorrowStartUtc + 24 * 60 * 60 * 1000;

  return {
    start: new Date(bogotaTomorrowStartUtc + BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000).toISOString(),
    end: new Date(bogotaTomorrowEndUtc + BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000).toISOString(),
  };
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 8 * * *', { timeZone: 'America/Bogota' })
  async sendDueTomorrowReminders(): Promise<BaseResponseDto<null>> {
    const { start, end } = getBogotaTomorrowRange();

    const assignments = await this.assignmentRepository.find({
      where: {
        dueDate: Between(start, end),
        emailReminderSentAt: IsNull(),
      },
    });

    if (assignments.length === 0) {
      return { status: 200, message: 'No assignments due tomorrow' };
    }

    const byUser = new Map<number, Assignment[]>();
    for (const assignment of assignments) {
      const list = byUser.get(assignment.user.id) ?? [];
      list.push(assignment);
      byUser.set(assignment.user.id, list);
    }

    for (const userAssignments of byUser.values()) {
      const user = userAssignments[0].user;
      try {
        await this.emailService.send({
          to: user.email,
          subject: 'Tareas que vencen mañana',
          html: this.buildHtml(userAssignments),
          text: this.buildText(userAssignments),
        });

        const sentAt = new Date();
        for (const assignment of userAssignments) {
          assignment.emailReminderSentAt = sentAt;
        }
        await this.assignmentRepository.save(userAssignments);
      } catch (error) {
        this.logger.error(
          `Failed to send due-tomorrow reminder to user ${user.id}: ${(error as Error).message}`,
        );
      }
    }

    return { status: 200, message: 'Due-tomorrow reminders processed' };
  }

  private buildHtml(assignments: Assignment[]): string {
    const items = assignments
      .map(
        (a) =>
          `<li><strong>${this.escapeHtml(a.title)}</strong> — ${this.escapeHtml(a.subject.name)} (${a.dueDate})</li>`,
      )
      .join('');
    return `<p>Tienes ${assignments.length} tarea(s) que vencen mañana:</p><ul>${items}</ul>`;
  }

  private buildText(assignments: Assignment[]): string {
    const lines = assignments.map((a) => `- ${a.title} — ${a.subject.name} (${a.dueDate})`);
    return `Tienes ${assignments.length} tarea(s) que vencen mañana:\n${lines.join('\n')}`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
