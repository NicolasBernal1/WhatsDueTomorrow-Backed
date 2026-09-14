# Due-Date Email Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every day at 8:00 AM `America/Bogota`, send each user with assignments due tomorrow one digest email (via Resend) listing those assignments.

**Architecture:** Two new NestJS modules in the backend (`WhatsDueTomorrow-Backed`). `EmailModule` is a generic, dependency-free wrapper around the Resend HTTP API. `RemindersModule` is domain-specific: it queries `Assignment` for tomorrow's due dates, groups by user, and calls `EmailModule`'s `EmailService.send()`. A new nullable `Assignment.emailReminderSentAt` column prevents double-sends. A `@nestjs/schedule` cron job triggers the daily run; a JWT-guarded `POST /reminders/trigger` endpoint allows manual triggering for testing.

**Tech Stack:** NestJS 11, TypeORM 0.3 (MySQL), `@nestjs/schedule` (new dependency), native `fetch` (Node 22, no Resend SDK), Jest (existing test setup).

**Spec:** `docs/superpowers/specs/2026-09-14-due-date-email-reminders-design.md`

## Global Constraints

- Env vars: `RESEND_API_KEY`, `EMAIL_FROM`, `ALLOW_EMAIL_LOG_FALLBACK` (optional) — already set in the local `.env` (gitignored); this plan adds `.env.example` documenting them.
- Cron: `0 8 * * *` with `timeZone: 'America/Bogota'` — no per-user timezone.
- New column name is `emailReminderSentAt` (NOT `reminderSentAt`) — the entity already has an unrelated `reminderMinutes` field for the existing browser-notification feature; names must stay visually distinct.
- One failed send must not block other users' sends in the same run (per-user try/catch).
- All new endpoints/services return the existing `BaseResponseDto<T>` envelope (`{ status, message, data? }`), matching every other module in this codebase.
- Follow existing repo conventions exactly: `@InjectRepository`, `AuthGuard('jwt')` at controller level, Jest spec files colocated with source, mock-repository test style (see `src/assignments/assignments.service.spec.ts`).

---

## File Structure

**New files:**
- `src/email/email.service.ts` — generic Resend wrapper (`EmailService.send()`)
- `src/email/email.module.ts` — exports `EmailService`
- `src/email/email.service.spec.ts`
- `src/reminders/reminders.service.ts` — `RemindersService.sendDueTomorrowReminders()` + `getBogotaTomorrowRange()` helper + `@Cron`
- `src/reminders/reminders.service.spec.ts`
- `src/reminders/reminders.controller.ts` — `POST /reminders/trigger`
- `src/reminders/reminders.controller.spec.ts`
- `src/reminders/reminders.module.ts`
- `.env.example`

**Modified files:**
- `src/assignments/entities/assignment.entity.ts` — add `emailReminderSentAt` column
- `src/app.module.ts` — register `ScheduleModule.forRoot()` and `RemindersModule`
- `package.json` — add `@nestjs/schedule`

---

### Task 1: EmailService (generic Resend wrapper)

**Files:**
- Create: `src/email/email.service.ts`
- Create: `src/email/email.module.ts`
- Test: `src/email/email.service.spec.ts`

**Interfaces:**
- Produces: `EmailService.send(input: SendEmailInput): Promise<void>`, where
  `SendEmailInput = { to: string; subject: string; html: string; text: string; idempotencyKey?: string; from?: string }`.
  Throws an `Error` on any failure (missing key without fallback, or a
  non-2xx Resend response). `EmailModule` exports `EmailService`.
- Consumes: nothing (no dependency on any other module).

- [ ] **Step 1: Write the failing tests**

Create `src/email/email.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  const originalEnv = process.env;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 're_test_key',
      EMAIL_FROM: 'Test <test@example.com>',
    };
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should POST to the Resend API with the right payload', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

    await service.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_key',
          'Content-Type': 'application/json',
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      from: 'Test <test@example.com>',
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });
  });

  it('should use the input "from" over EMAIL_FROM when provided', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

    await service.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      from: 'Custom <custom@example.com>',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.from).toBe('Custom <custom@example.com>');
  });

  it('should throw when the Resend API responds with an error status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => 'Invalid from address',
    });

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).rejects.toThrow('Resend API error (422): Invalid from address');
  });

  it('should throw when RESEND_API_KEY is missing and fallback is not enabled', async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ALLOW_EMAIL_LOG_FALLBACK;

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).rejects.toThrow('RESEND_API_KEY is not set');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should log instead of throwing when RESEND_API_KEY is missing and fallback is enabled', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.ALLOW_EMAIL_LOG_FALLBACK = 'true';

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- email.service.spec.ts`
Expected: FAIL — `Cannot find module './email.service'`

- [ ] **Step 3: Write the implementation**

Create `src/email/email.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  from?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(input: SendEmailInput): Promise<void> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const from =
      input.from ||
      process.env.EMAIL_FROM ||
      'WhatsDueTomorrow <onboarding@resend.dev>';

    if (!resendApiKey) {
      if (process.env.ALLOW_EMAIL_LOG_FALLBACK === 'true') {
        this.logger.warn(
          `RESEND_API_KEY not set — logging instead of sending. to=${input.to} subject="${input.subject}"`,
        );
        return;
      }
      throw new Error(
        'RESEND_API_KEY is not set and ALLOW_EMAIL_LOG_FALLBACK is not "true"',
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API error (${response.status}): ${body}`);
    }
  }
}
```

Create `src/email/email.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- email.service.spec.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/email/
git commit -m "$(cat <<'EOF'
Add EmailService wrapping the Resend HTTP API

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `emailReminderSentAt` column + RemindersService core logic

**Files:**
- Modify: `src/assignments/entities/assignment.entity.ts`
- Modify: `package.json` (add `@nestjs/schedule`)
- Create: `src/reminders/reminders.service.ts`
- Test: `src/reminders/reminders.service.spec.ts`

**Interfaces:**
- Consumes: `EmailService.send()` from Task 1 (`src/email/email.service.ts`).
- Produces: `RemindersService.sendDueTomorrowReminders(): Promise<BaseResponseDto<null>>`
  and the exported helper `getBogotaTomorrowRange(now?: Date): { start: string; end: string }`
  (both from `src/reminders/reminders.service.ts`) — Task 3's controller
  calls `sendDueTomorrowReminders()` directly.
- `Assignment.emailReminderSentAt: Date | null` — new column consumed by
  this task and readable by anything importing the entity.

- [ ] **Step 1: Add the `@nestjs/schedule` dependency**

```bash
npm install @nestjs/schedule
```

- [ ] **Step 2: Add the `emailReminderSentAt` column to the entity**

In `src/assignments/entities/assignment.entity.ts`, add the column next
to the existing `reminderMinutes` one (keep both — they serve unrelated
features):

```typescript
  // Minutes before the deadline at which the browser notification is scheduled.
  @Column({ type: 'int', nullable: true })
  reminderMinutes?: number | null;

  // Set once the daily due-tomorrow digest email has been sent for this assignment.
  @Column({ type: 'datetime', nullable: true })
  emailReminderSentAt?: Date | null;
```

- [ ] **Step 3: Write the failing tests**

Create `src/reminders/reminders.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RemindersService, getBogotaTomorrowRange } from './reminders.service';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { EmailService } from 'src/email/email.service';

const mockUserA = { id: 1, name: 'Ana', email: 'ana@example.com', password: 'x' };
const mockUserB = { id: 2, name: 'Beto', email: 'beto@example.com', password: 'x' };
const mockSubject = { id: 10, name: 'Math', professor: 'Dr. Smith', color: '#ff0000' };

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 1,
    title: 'Tarea',
    description: '',
    dueDate: '2026-01-02T10:00:00.000Z',
    emailReminderSentAt: null,
    reminderMinutes: null,
    user: mockUserA as any,
    subject: mockSubject as any,
    subtasks: [],
    ...overrides,
  } as Assignment;
}

const mockAssignmentRepository = {
  find: jest.fn(),
  save: jest.fn(),
};

const mockEmailService = {
  send: jest.fn(),
};

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepository },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBogotaTomorrowRange', () => {
    it('should return the UTC boundaries of "tomorrow" in America/Bogota (UTC-5)', () => {
      // 2026-01-01 12:00 UTC = 2026-01-01 07:00 Bogota -> tomorrow is 2026-01-02 Bogota
      const now = new Date('2026-01-01T12:00:00.000Z');

      const { start, end } = getBogotaTomorrowRange(now);

      expect(start).toBe('2026-01-02T05:00:00.000Z'); // 2026-01-02 00:00 Bogota
      expect(end).toBe('2026-01-03T05:00:00.000Z'); // 2026-01-03 00:00 Bogota
    });

    it('should roll over correctly when "now" is already past midnight UTC', () => {
      // 2026-03-10 02:00 UTC = 2026-03-09 21:00 Bogota -> tomorrow is 2026-03-10 Bogota
      const now = new Date('2026-03-10T02:00:00.000Z');

      const { start, end } = getBogotaTomorrowRange(now);

      expect(start).toBe('2026-03-10T05:00:00.000Z');
      expect(end).toBe('2026-03-11T05:00:00.000Z');
    });
  });

  describe('sendDueTomorrowReminders', () => {
    it('should query assignments due tomorrow with no reminder sent yet', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          dueDate: expect.anything(),
          emailReminderSentAt: expect.anything(),
        }),
      });
    });

    it('should return early without sending email when there are no assignments due tomorrow', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.sendDueTomorrowReminders();

      expect(result.status).toBe(200);
      expect(result.message).toBe('No assignments due tomorrow');
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });

    it('should group assignments by user and send one email per user', async () => {
      const assignmentA1 = makeAssignment({ id: 1, user: mockUserA as any });
      const assignmentA2 = makeAssignment({ id: 2, user: mockUserA as any, title: 'Tarea 2' });
      const assignmentB1 = makeAssignment({ id: 3, user: mockUserB as any });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA1, assignmentA2, assignmentB1]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockEmailService.send).toHaveBeenCalledTimes(2);
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'ana@example.com' }),
      );
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'beto@example.com' }),
      );
    });

    it('should include every assignment title in the email body for a user with multiple assignments', async () => {
      const assignmentA1 = makeAssignment({ id: 1, user: mockUserA as any, title: 'Tarea Uno' });
      const assignmentA2 = makeAssignment({ id: 2, user: mockUserA as any, title: 'Tarea Dos' });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA1, assignmentA2]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      const call = mockEmailService.send.mock.calls[0][0];
      expect(call.html).toContain('Tarea Uno');
      expect(call.html).toContain('Tarea Dos');
      expect(call.text).toContain('Tarea Uno');
      expect(call.text).toContain('Tarea Dos');
    });

    it('should mark emailReminderSentAt on assignments after a successful send', async () => {
      const assignment = makeAssignment({ id: 1 });
      mockAssignmentRepository.find.mockResolvedValue([assignment]);
      mockEmailService.send.mockResolvedValue(undefined);
      mockAssignmentRepository.save.mockResolvedValue([assignment]);

      await service.sendDueTomorrowReminders();

      expect(mockAssignmentRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, emailReminderSentAt: expect.any(Date) }),
      ]);
    });

    it('should NOT mark emailReminderSentAt for a user whose send failed, and should still process other users', async () => {
      const assignmentA = makeAssignment({ id: 1, user: mockUserA as any });
      const assignmentB = makeAssignment({ id: 2, user: mockUserB as any });
      mockAssignmentRepository.find.mockResolvedValue([assignmentA, assignmentB]);
      mockEmailService.send
        .mockRejectedValueOnce(new Error('Resend API error (500): boom'))
        .mockResolvedValueOnce(undefined);
      mockAssignmentRepository.save.mockResolvedValue([]);

      await service.sendDueTomorrowReminders();

      expect(mockEmailService.send).toHaveBeenCalledTimes(2);
      expect(mockAssignmentRepository.save).toHaveBeenCalledTimes(1);
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ id: 2, emailReminderSentAt: expect.any(Date) }),
      ]);
    });
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- reminders.service.spec.ts`
Expected: FAIL — `Cannot find module './reminders.service'`

- [ ] **Step 5: Write the implementation**

Create `src/reminders/reminders.service.ts`:

```typescript
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- reminders.service.spec.ts`
Expected: PASS (9 tests)

- [ ] **Step 7: Run the full backend suite to confirm nothing else broke**

Run: `npm test`
Expected: all suites pass (the pre-existing 161 tests plus the new ones from this plan)

- [ ] **Step 8: Commit**

```bash
git add src/assignments/entities/assignment.entity.ts src/reminders/reminders.service.ts src/reminders/reminders.service.spec.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add RemindersService: daily due-tomorrow email digest

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: RemindersController + module wiring

**Files:**
- Create: `src/reminders/reminders.controller.ts`
- Create: `src/reminders/reminders.module.ts`
- Test: `src/reminders/reminders.controller.spec.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: `RemindersService.sendDueTomorrowReminders()` from Task 2.
- Produces: `POST /reminders/trigger` (JWT-guarded), returning
  `BaseResponseDto<null>` — nothing else depends on this endpoint within
  this plan; it exists for manual/local testing.

- [ ] **Step 1: Write the failing test**

Create `src/reminders/reminders.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

const mockRemindersService = {
  sendDueTomorrowReminders: jest.fn(),
};

describe('RemindersController', () => {
  let controller: RemindersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [{ provide: RemindersService, useValue: mockRemindersService }],
    }).compile();

    controller = module.get<RemindersController>(RemindersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate to RemindersService.sendDueTomorrowReminders', async () => {
    mockRemindersService.sendDueTomorrowReminders.mockResolvedValue({
      status: 200,
      message: 'Due-tomorrow reminders processed',
    });

    const result = await controller.trigger();

    expect(mockRemindersService.sendDueTomorrowReminders).toHaveBeenCalled();
    expect(result).toEqual({ status: 200, message: 'Due-tomorrow reminders processed' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- reminders.controller.spec.ts`
Expected: FAIL — `Cannot find module './reminders.controller'`

- [ ] **Step 3: Write the implementation**

Create `src/reminders/reminders.controller.ts`:

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RemindersService } from './reminders.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('trigger')
  async trigger(): Promise<BaseResponseDto<null>> {
    return this.remindersService.sendDueTomorrowReminders();
  }
}
```

Create `src/reminders/reminders.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { EmailModule } from 'src/email/email.module';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment]), EmailModule],
  providers: [RemindersService],
  controllers: [RemindersController],
  exports: [RemindersService],
})
export class RemindersModule {}
```

In `src/app.module.ts`, add the two new imports (`ScheduleModule.forRoot()`
enables `@Cron` app-wide; it only needs to be registered once):

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './reminders/reminders.module';
```

and add both to the `imports` array (order doesn't matter, but keep it
next to the other feature modules for readability):

```typescript
    UsersModule,
    SubjectsModule,
    AssignmentsModule,
    SubtasksModule,
    CalendarModule,
    NotesModule,
    EvaluationsModule,
    RemindersModule,
    AuthModule,
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- reminders.controller.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Start the app and confirm it boots with the new route mapped**

Run: `npm run start:dev` (or check the already-running dev server's
logs if one is active)
Expected: log line `Mapped {/reminders/trigger, POST} route` and
`Nest application successfully started` with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/reminders/reminders.controller.ts src/reminders/reminders.controller.spec.ts src/reminders/reminders.module.ts src/app.module.ts
git commit -m "$(cat <<'EOF'
Wire up RemindersModule and POST /reminders/trigger

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `.env.example` + manual end-to-end verification

**Files:**
- Create: `.env.example`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: nothing consumed by other tasks — this is the final
  integration/manual-verification step.

- [ ] **Step 1: Create `.env.example`**

Create `.env.example` at the repo root:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=changeme
DB_DATABASE=wdt
JWT_SECRET=changeme
PORT=3000

# Resend (https://resend.com) — used by EmailService for the due-date reminder digest
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=WhatsDueTomorrow <onboarding@resend.dev>
# Optional: when "true", EmailService logs instead of sending if RESEND_API_KEY is unset (dev only)
ALLOW_EMAIL_LOG_FALLBACK=false
```

- [ ] **Step 2: Manually verify against the running local backend**

With the local dev server running (`npm run start:dev`, `.env` already
has the real Resend sandbox key) and at least one assignment due
"tomorrow" (in `America/Bogota`) for the logged-in test user:

```bash
curl -X POST http://localhost:3000/reminders/trigger \
  -H "Authorization: Bearer <a real JWT from POST /auth/login>"
```

Expected: `{"status":200,"message":"Due-tomorrow reminders processed"}`
and an email arrives at the Resend-sandbox-registered address
(`krolita1730@gmail.com`) within a minute. Confirm in the DB that the
assignment's `emailReminderSentAt` is now set:

```bash
docker exec wdt-mysql mysql -uroot -pwdt_dev_pass wdt -e "SELECT id, title, dueDate, emailReminderSentAt FROM assignment WHERE emailReminderSentAt IS NOT NULL;"
```

- [ ] **Step 3: Run the full backend test suite one final time**

Run: `npm test`
Expected: all suites pass, including every spec added in this plan.

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "$(cat <<'EOF'
Add .env.example documenting Resend reminder env vars

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
