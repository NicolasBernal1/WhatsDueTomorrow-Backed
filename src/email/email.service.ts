import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const from = input.from || process.env.EMAIL_FROM || gmailUser || 'WhatsDueTomorrow';

    if (!gmailUser || !gmailAppPassword) {
      if (process.env.ALLOW_EMAIL_LOG_FALLBACK === 'true') {
        this.logger.warn(
          `GMAIL_USER/GMAIL_APP_PASSWORD not set — logging instead of sending. to=${input.to} subject="${input.subject}"`,
        );
        return;
      }
      throw new Error(
        'GMAIL_USER and GMAIL_APP_PASSWORD must both be set (or ALLOW_EMAIL_LOG_FALLBACK="true")',
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    try {
      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
    } catch (error) {
      throw new Error(`Gmail SMTP error: ${(error as Error).message}`);
    }
  }
}
