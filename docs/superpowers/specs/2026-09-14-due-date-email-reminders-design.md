# Due-date email reminders — design

## Context

WhatsDueTomorrow has two existing "reminder-like" mechanisms, neither of
which sends email:

- **Web reminder / Urgent Radar** (`Assignment.reminderMinutes`,
  `src/app/services/urgent-alert.service.ts` in the frontend): a
  browser `Notification` fired client-side while the tab is open.
  Doesn't work if the browser is closed.
- **Calendar feed** (`src/calendar/`): an `.ics` feed users can
  subscribe to in Google Calendar/Outlook. Reminders, if any, depend on
  the external calendar app's own defaults.

Neither reaches the user reliably and independently of the browser/app
being open. This spec adds a **daily email digest** sent regardless of
whether the app is open, using Resend.

## Goal

Every day at 8:00 AM `America/Bogota`, each user with assignments due
**tomorrow** (calendar day) receives one email listing them, grouped by
subject.

## Non-goals

- No push/SMS notifications.
- No per-user timezone (single fixed `America/Bogota` cron, matching
  the rest of the app which has no per-user timezone support today).
- No "completed" status filtering — `Assignment` has no completion
  field; every assignment due tomorrow is included (matches how the
  rest of the app already treats assignments).
- No retry queue for failed sends — a failure is logged and the
  assignment is left unmarked so it can be resent manually via the
  trigger endpoint; it will NOT be automatically retried by the next
  day's cron run (by then its due date is "today", not "tomorrow").

## Components

### `src/email/` (generic, reusable, copied from the reference pattern)

- `email.service.ts` — `EmailService.send({to, subject, html, text,
  from?})`, posts to `https://api.resend.com/emails` via `fetch`. No
  SDK dependency. Throws if `RESEND_API_KEY` is unset, unless
  `ALLOW_EMAIL_LOG_FALLBACK=true` (dev-only escape hatch), in which
  case it logs instead of sending.
- `email.module.ts` — exports `EmailService`. No dependencies on the
  rest of the app.

Env vars (documented in `.env.example`):
- `RESEND_API_KEY`
- `EMAIL_FROM` (e.g. `WhatsDueTomorrow <onboarding@resend.dev>` for
  the Resend sandbox, until a verified custom domain is available)
- `ALLOW_EMAIL_LOG_FALLBACK` (optional, `"true"`/`"false"`)

### `src/reminders/` (domain-specific)

- Adds `Assignment.emailReminderSentAt: Date | null` (nullable
  `datetime` column via `synchronize: true`, matching the project's
  existing dev-mode schema management). Named distinctly from the
  existing `reminderMinutes` field to avoid confusion between the two
  unrelated reminder mechanisms.
- `RemindersService.sendDueTomorrowReminders()`:
  1. Compute `[startOfTomorrow, endOfTomorrow)` in `America/Bogota`.
  2. Query `Assignment` where `dueDate` falls in that range and
     `emailReminderSentAt IS NULL` (`user` and `subject` are already
     `eager` relations on `Assignment`, so no extra joins needed).
  3. Group the results by `user.id`.
  4. For each user, build one digest email (HTML + plain text) listing
     each assignment's title, subject name, and due time.
  5. Call `EmailService.send({to: user.email, ...})`.
  6. On success, set `emailReminderSentAt = now()` on every assignment
     in that user's batch and save. On failure, log the error (via
     Nest's `Logger`) and leave that user's assignments unmarked;
     continue with the next user — one user's failure must not block
     others.
- `@Cron('0 8 * * *', { timeZone: 'America/Bogota' })` on
  `sendDueTomorrowReminders`, registered via `@nestjs/schedule`
  (new dependency — not currently in `package.json`).
- `POST /reminders/trigger` on `RemindersController`, guarded the same
  way as the rest of the API (`@UseGuards(AuthGuard('jwt'))`), calling
  the same service method — lets us test locally without waiting for
  8 AM. Returns the same `BaseResponseDto` envelope used everywhere
  else in the API.

`RemindersModule` imports `TypeOrmModule.forFeature([Assignment])` and
`EmailModule`, and is registered in `AppModule`.

## Data flow

```
ScheduleModule cron (8AM Bogota)
  -> RemindersService.sendDueTomorrowReminders()
    -> query Assignment (dueDate = tomorrow, emailReminderSentAt IS NULL)
    -> group by user
    -> per user: build html/text -> EmailService.send()
    -> on success: mark emailReminderSentAt = now()
```

`POST /reminders/trigger` invokes the same method on demand.

## Error handling

- Missing `RESEND_API_KEY` in an environment without
  `ALLOW_EMAIL_LOG_FALLBACK=true` → `EmailService.send` throws;
  `RemindersService` catches it per-user, logs, and moves on.
- Resend API error response (4xx/5xx) → same: logged per-user,
  doesn't block the rest of the batch, doesn't mark
  `emailReminderSentAt`.
- Cron itself doesn't throw uncaught: the whole
  `sendDueTomorrowReminders` body is wrapped so one bad iteration can't
  kill the scheduler for future days.

## Testing

- `reminders.service.spec.ts` (unit, mocking the `Assignment`
  repository and `EmailService`, following the existing
  `*.service.spec.ts` style already used throughout the codebase):
  - Correct date-range filter for "tomorrow" in `America/Bogota`.
  - Correct grouping by user when multiple users/assignments are due.
  - `EmailService.send` called once per user with the right
    recipient/content.
  - `emailReminderSentAt` set only on assignments whose send
    succeeded; left `null` on failure.
- Manual verification: `POST /reminders/trigger` locally against the
  Resend sandbox key, confirming the email arrives at the developer's
  own Resend-registered address.
