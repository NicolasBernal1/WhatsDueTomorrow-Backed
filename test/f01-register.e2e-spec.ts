import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Should } from '../src/common/fluent-assertions';
import { api, ANA, registerUser } from './support/api';
import { createE2EApp } from './support/create-app';

describe('F01 · Registrar Estudiante (e2e backend)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2EApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registra a un estudiante y responde 201 sin exponer la contraseña', async () => {
    const res = await registerUser(app);

    res.status.Should().Be(201);
    res.body.message.Should().Be('User registered successfully');
    res.body.data.Should().Contain({ name: ANA.name, email: ANA.email });
    res.body.data.id.Should().BeGreaterThan(0);
    Should(res.body.data.password).BeUndefined();
  });

  it('guarda la contraseña cifrada con bcrypt y no en texto plano', async () => {
    await registerUser(app);

    const rows = await app
      .get(DataSource)
      .query('SELECT password FROM user WHERE email = ?', [ANA.email]);

    Should(rows).HaveCount(1);
    Should(rows[0].password).NotBe(ANA.password);
    (await bcrypt.compare(ANA.password, rows[0].password)).Should().BeTrue();
  });

  it('rechaza un correo ya registrado con 409 y no crea un segundo usuario', async () => {
    await registerUser(app);

    const res = await registerUser(app, { ...ANA, name: 'Otra Ana' });

    res.status.Should().Be(409);
    const rows = await app.get(DataSource).query('SELECT id FROM user');
    Should(rows).HaveCount(1);
  });

  it('rechaza un correo con formato inválido con 400', async () => {
    const res = await api(app)
      .post('/auth/register')
      .send({ ...ANA, email: 'no-es-correo' });

    res.status.Should().Be(400);
  });

  it('rechaza un nombre con números con 400', async () => {
    const res = await api(app)
      .post('/auth/register')
      .send({ ...ANA, name: 'Ana123' });

    res.status.Should().Be(400);
  });

  it('rechaza campos obligatorios vacíos con 400', async () => {
    const res = await api(app).post('/auth/register').send({});

    res.status.Should().Be(400);
  });

  it('rechaza propiedades desconocidas con 400 (whitelist)', async () => {
    const res = await api(app)
      .post('/auth/register')
      .send({ ...ANA, role: 'admin' });

    res.status.Should().Be(400);
  });
});