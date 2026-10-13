import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Should } from '../src/common/fluent-assertions';
import { ANA, api, bearer, loginUser, registerAndLogin } from './support/api';
import { createE2EApp } from './support/create-app';

describe('F05 · Cambiar Contraseña (e2e backend)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    app = await createE2EApp();
    ({ token } = await registerAndLogin(app));
  });

  afterEach(async () => {
    await app.close();
  });

  it('verifica la contraseña actual correcta con 200', async () => {
    const res = await api(app)
      .patch('/auth/verify-password')
      .set(bearer(token))
      .send({ password: ANA.password });

    res.status.Should().Be(200);
    res.body.message.Should().Be('Password verified successfully');
  });

  it('rechaza una contraseña actual incorrecta con 401', async () => {
    const res = await api(app)
      .patch('/auth/verify-password')
      .set(bearer(token))
      .send({ password: 'incorrecta' });

    res.status.Should().Be(401);
  });

  it('verify-password sin token responde 401', async () => {
    const res = await api(app)
      .patch('/auth/verify-password')
      .send({ password: ANA.password });

    res.status.Should().Be(401);
  });

  it('cambia la contraseña: la nueva funciona y la anterior deja de funcionar', async () => {
    const change = await api(app)
      .patch('/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: ANA.password, newPassword: 'Nueva456' });

    const conNueva = await loginUser(app, ANA.email, 'Nueva456');
    const conVieja = await loginUser(app, ANA.email, ANA.password);

    change.status.Should().Be(200);
    change.body.message.Should().Be('Password updated successfully');
    conNueva.status.Should().Be(201);
    conVieja.status.Should().Be(401);
  });

  it('no cambia la contraseña si la actual es incorrecta', async () => {
    const change = await api(app)
      .patch('/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: 'incorrecta', newPassword: 'Nueva456' });

    const conOriginal = await loginUser(app);

    change.status.Should().Be(401);
    conOriginal.status.Should().Be(201);
  });

  it('rechaza una nueva contraseña vacía con 400', async () => {
    const res = await api(app)
      .patch('/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: ANA.password, newPassword: '' });

    res.status.Should().Be(400);
  });

  it('change-password sin token responde 401', async () => {
    const res = await api(app)
      .patch('/auth/change-password')
      .send({ currentPassword: ANA.password, newPassword: 'Nueva456' });

    res.status.Should().Be(401);
  });

  it('la nueva contraseña queda cifrada con bcrypt', async () => {
    await api(app)
      .patch('/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: ANA.password, newPassword: 'Nueva456' });

    const rows = await app
      .get(DataSource)
      .query('SELECT password FROM user WHERE email = ?', [ANA.email]);

    Should(rows[0].password).NotBe('Nueva456');
    (await bcrypt.compare('Nueva456', rows[0].password)).Should().BeTrue();
  });
});