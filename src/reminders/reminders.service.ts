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
export type ReminderRunResult = {
  totalUsers: number;
  sentUsers: number;
  failedUsers: { userId: number; email: string; error: string }[];
};

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
  async sendDueTomorrowReminders(): Promise<BaseResponseDto<ReminderRunResult>> {
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

    const failedUsers: ReminderRunResult['failedUsers'] = [];
    let sentUsers = 0;

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
        sentUsers += 1;
      } catch (error) {
        const message = (error as Error).message;
        this.logger.error(`Failed to send due-tomorrow reminder to user ${user.id}: ${message}`);
        failedUsers.push({ userId: user.id, email: user.email, error: message });
      }
    }

    return {
      status: 200,
      message: 'Due-tomorrow reminders processed',
      data: { totalUsers: byUser.size, sentUsers, failedUsers },
    };
  }

  private buildHtml(assignments: Assignment[]): string {
    const items = assignments
      .map(
        (a) =>
          `<li><strong>${this.escapeHtml(a.title)}</strong> — ${this.escapeHtml(a.subject.name)} (${this.formatDueDate(a.dueDate)})</li>`,
      )
      .join('');
    return `<p>Tienes ${assignments.length} tarea(s) que vencen mañana:</p><ul>${items}</ul>`;
  }

  private buildText(assignments: Assignment[]): string {
    const lines = assignments.map(
      (a) => `- ${a.title} — ${a.subject.name} (${this.formatDueDate(a.dueDate)})`,
    );
    return `Tienes ${assignments.length} tarea(s) que vencen mañana:\n${lines.join('\n')}`;
  }

  /**
   * dueDate arrives as a JS Date at runtime (TypeORM returns MySQL `datetime`
   * columns as Date objects, despite the entity typing it as `string`) — never
   * interpolate it directly, or you get raw Date#toString() output like
   * "Tue Sep 15 2026 23:59:00 GMT-0500 (hora estándar de Colombia)".
   */
  private formatDueDate(dueDate: string | Date): string {
    return new Date(dueDate).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
