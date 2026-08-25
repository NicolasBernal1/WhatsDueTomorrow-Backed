import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../app.module';

// ════════════════════════════════════════════════════════════════════════════
// CAJA NEGRA · INICIAR SESIÓN — POST /auth/login
// ════════════════════════════════════════════════════════════════════════════

describe('POST /auth/login (e2e - caja negra)', () => {
  let app: INestApplication<App>;
  const email = `login_${Date.now()}@test.com`;
  const password = 'Clave123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    // Fixture: usuario válido para los casos de éxito/contraseña incorrecta
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Login User', email, password });
  });

  afterAll(async () => {
    await app.close();
  });

  it('CN1: login con credenciales correctas -> 200 + token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe(email);
      });
  });

  it('CN2: email no registrado -> 404', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'fantasma@test.com', password: 'cualquiera' })
      .expect(404);
  });

  it('CN3: contraseña incorrecta -> 401', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'incorrecta' })
      .expect(401);
  });

  it('CN4: campo email vacío -> 400', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: '', password })
      .expect(400);
  });

  it('CN5: campo password vacío -> 400', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: '' })
      .expect(400);
  });
});
