import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Should } from '../src/common/fluent-assertions';
import { ANA, api, loginUser, registerUser } from './support/api';
import { createE2EApp } from './support/create-app';

describe('F02 · Iniciar Sesión (e2e backend)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2EApp();
    await registerUser(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it('inicia sesión con credenciales válidas y devuelve token y usuario', async () => {
    const res = await loginUser(app);

    res.status.Should().Be(201);
    res.body.message.Should().Be('Logged in successfully');
    res.body.data.token.Should().NotBeEmpty();
    res.body.data.user.Should().Contain({ name: ANA.name, email: ANA.email });
    Should(res.body.data.user.password).BeUndefined();
  });

  it('el token contiene solo sub y email del usuario', async () => {
    const res = await loginUser(app);

    const payload = app.get(JwtService).decode(res.body.data.token);

    payload.sub.Should().Be(res.body.data.user.id);
    payload.email.Should().Be(ANA.email);
    Should(payload.password).BeUndefined();
  });

  it('rechaza una contraseña incorrecta con 401', async () => {
    const res = await loginUser(app, ANA.email, 'incorrecta');

    res.status.Should().Be(401);
    Should(res.body.data).BeUndefined();
  });

  it('rechaza un usuario inexistente con 404', async () => {
    const res = await loginUser(app, 'nadie@test.com', ANA.password);

    res.status.Should().Be(404);
  });

  it('rechaza un correo con formato inválido con 400', async () => {
    const res = await loginUser(app, 'no-es-correo', ANA.password);

    res.status.Should().Be(400);
  });

  it('rechaza el cuerpo vacío con 400', async () => {
    const res = await api(app).post('/auth/login').send({});

    res.status.Should().Be(400);
  });
});