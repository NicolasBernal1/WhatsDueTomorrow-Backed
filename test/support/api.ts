import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const ANA = {
  name: 'Ana',
  email: 'ana@test.com',
  password: 'Clave123',
};

export function api(app: INestApplication) {
  return request(app.getHttpServer());
}

export async function registerUser(
  app: INestApplication,
  user: { name: string; email: string; password: string } = ANA,
) {
  return api(app).post('/auth/register').send(user);
}

export async function loginUser(
  app: INestApplication,
  email: string = ANA.email,
  password: string = ANA.password,
) {
  return api(app).post('/auth/login').send({ email, password });
}

export async function registerAndLogin(
  app: INestApplication,
  user: { name: string; email: string; password: string } = ANA,
): Promise<{ token: string; id: number }> {
  await registerUser(app, user);
  const res = await loginUser(app, user.email, user.password);
  return { token: res.body.data.token, id: res.body.data.user.id };
}

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}