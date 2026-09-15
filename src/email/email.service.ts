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
