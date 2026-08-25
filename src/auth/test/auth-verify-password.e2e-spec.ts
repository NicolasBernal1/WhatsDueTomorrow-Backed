import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../app.module';

// ════════════════════════════════════════════════════════════════════════════
// CAJA NEGRA · VERIFICAR CONTRASEÑA — PATCH /auth/verify-password
// ════════════════════════════════════════════════════════════════════════════

describe('PATCH /auth/verify-password (e2e - caja negra)', () => {
  let app: INestApplication<App>;
  const email = `verify_${Date.now()}@test.com`;
  const password = 'Clave123';
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    // Fixture: usuario autenticado
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Verify User', email, password });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('CN1: sesión activa + contraseña correcta -> 200', () => {
    return request(app.getHttpServer())
      .patch('/auth/verify-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password })
      .expect(200);
  });

  it('CN2: sesión activa + contraseña incorrecta -> 401', () => {
    return request(app.getHttpServer())
      .patch('/auth/verify-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'incorrecta' })
      .expect(401);
  });

  it('CN3: sin token (sin sesión activa) -> 401', () => {
    return request(app.getHttpServer())
      .patch('/auth/verify-password')
      .send({ password })
      .expect(401);
  });

  it('CN4: token inválido/mal formado -> 401', () => {
    return request(app.getHttpServer())
      .patch('/auth/verify-password')
      .set('Authorization', 'Bearer token-invalido')
      .send({ password })
      .expect(401);
  });
});
