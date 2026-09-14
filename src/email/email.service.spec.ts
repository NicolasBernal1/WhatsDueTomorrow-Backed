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
