import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../app.module';

// ════════════════════════════════════════════════════════════════════════════
// CAJA NEGRA · REGISTRAR ESTUDIANTE — POST /auth/register
// Prueba a través del endpoint HTTP real (sin mocks), por clases de equivalencia.
// Requiere una base de datos MySQL real y accesible según tu .env.
// ════════════════════════════════════════════════════════════════════════════

describe('POST /auth/register (e2e - caja negra)', () => {
  let app: INestApplication<App>;
  const uniqueEmail = `nuevo_${Date.now()}@test.com`;
  const existingEmail = `existente_${Date.now()}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    // Fixture: usuario ya existente en BD, usado en el caso CN2
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Usuario Existente', email: existingEmail, password: 'Clave123' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('CN1: registro con datos completos y válidos -> 201, usuario creado sin password', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ana', email: uniqueEmail, password: 'Clave123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ name: 'Ana', email: uniqueEmail });
        expect(res.body.data.password).toBeUndefined();
      });
  });

  it('CN2: email ya en uso -> 409', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Otra Persona', email: existingEmail, password: 'OtraClave1' })
      .expect(409);
  });

  it('CN3: campo name vacío -> 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: `cn3_${Date.now()}@test.com`, password: 'Clave123' })
      .expect(400);
  });

  it('CN4: campo email vacío -> 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ana', email: '', password: 'Clave123' })
      .expect(400);
  });

  it('CN5: campo password vacío -> 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ana', email: `cn5_${Date.now()}@test.com`, password: '' })
      .expect(400);
  });
});
