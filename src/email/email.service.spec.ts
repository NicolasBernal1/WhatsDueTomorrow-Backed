import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  const originalEnv = process.env;
  let sendMailMock: jest.Mock;
  let createTransportMock: jest.Mock;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      GMAIL_USER: 'test@gmail.com',
      GMAIL_APP_PASSWORD: 'test-app-password',
      EMAIL_FROM: 'Test <test@gmail.com>',
    };

    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'abc' });
    createTransportMock = nodemailer.createTransport as jest.Mock;
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send via nodemailer using Gmail SMTP auth', async () => {
    await service.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'test@gmail.com', pass: 'test-app-password' },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Test <test@gmail.com>',
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });
  });

  it('should use the input "from" over EMAIL_FROM when provided', async () => {
    await service.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      from: 'Custom <custom@example.com>',
    });

    expect(sendMailMock.mock.calls[0][0].from).toBe('Custom <custom@example.com>');
  });

  it('should throw a descriptive error when sendMail rejects', async () => {
    sendMailMock.mockRejectedValue(new Error('Invalid login'));

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).rejects.toThrow('Gmail SMTP error: Invalid login');
  });

  it('should throw when GMAIL_USER/GMAIL_APP_PASSWORD are missing and fallback is not enabled', async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.ALLOW_EMAIL_LOG_FALLBACK;

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).rejects.toThrow('GMAIL_USER and GMAIL_APP_PASSWORD must both be set');
    expect(createTransportMock).not.toHaveBeenCalled();
  });

  it('should log instead of throwing when credentials are missing and fallback is enabled', async () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    process.env.ALLOW_EMAIL_LOG_FALLBACK = 'true';

    await expect(
      service.send({ to: 'user@example.com', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' }),
    ).resolves.toBeUndefined();
    expect(createTransportMock).not.toHaveBeenCalled();
  });
});
