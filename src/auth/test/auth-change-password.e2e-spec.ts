import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../app.module';

// ════════════════════════════════════════════════════════════════════════════
// CAJA NEGRA · CAMBIAR CONTRASEÑA — PATCH /auth/change-password
// ════════════════════════════════════════════════════════════════════════════

describe('PATCH /auth/change-password (e2e - caja negra)', () => {
  let app: INestApplication<App>;
  const email = `change_${Date.now()}@test.com`;
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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Change Pwd User', email, password });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('CN2: contraseña actual incorrecta -> 401 (no modifica la contraseña)', () => {
    return request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'incorrecta', newPassword: 'NuevaClave1' })
      .expect(401);
  });

  it('CN3: sin sesión activa (sin token) -> 401', () => {
    return request(app.getHttpServer())
      .patch('/auth/change-password')
      .send({ currentPassword: password, newPassword: 'NuevaClave1' })
      .expect(401);
  });

  it('CN4: campo newPassword vacío -> 400', () => {
    return request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: '' })
      .expect(400);
  });

  it('CN5: campo currentPassword vacío -> 400', () => {
    return request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '', newPassword: 'NuevaClave1' })
      .expect(400);
  });

  // CN1 se deja al final porque, si tiene éxito, cambia la contraseña real del
  // usuario de prueba: después de este caso, "password" original deja de servir.
  it('CN1: cambio exitoso -> 200, y la nueva contraseña permite iniciar sesión', async () => {
    await request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: 'NuevaClave1' })
      .expect(200);

    // Confirmación black-box: la contraseña vieja ya no funciona...
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);

    // ...y la nueva sí.
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'NuevaClave1' })
      .expect(200);
  });
});
