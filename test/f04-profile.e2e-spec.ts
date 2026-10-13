import { INestApplication } from '@nestjs/common';
import { Should } from '../src/common/fluent-assertions';
import { ANA, api, bearer, loginUser, registerAndLogin } from './support/api';
import { createE2EApp } from './support/create-app';

describe('F04 · Consultar Perfil (e2e backend)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2EApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve nombre y correo del usuario autenticado', async () => {
    const { token, id } = await registerAndLogin(app);

    const res = await api(app).get('/users/profile').set(bearer(token));

    res.status.Should().Be(200);
    res.body.data.Should().BeEquivalentTo({
      id,
      name: ANA.name,
      email: ANA.email,
    });
  });

  it('no expone la contraseña en el perfil', async () => {
    const { token } = await registerAndLogin(app);

    const res = await api(app).get('/users/profile').set(bearer(token));

    Should(res.body.data.password).BeUndefined();
  });

  it('cada usuario ve únicamente su propio perfil', async () => {
    const ana = await registerAndLogin(app);
    const luis = await registerAndLogin(app, {
      name: 'Luis',
      email: 'luis@test.com',
      password: 'Otra456',
    });

    const resAna = await api(app).get('/users/profile').set(bearer(ana.token));
    const resLuis = await api(app).get('/users/profile').set(bearer(luis.token));

    resAna.body.data.email.Should().Be(ANA.email);
    resLuis.body.data.email.Should().Be('luis@test.com');
  });

  it('sin token responde 401', async () => {
    const res = await api(app).get('/users/profile');

    res.status.Should().Be(401);
  });

  it('eliminar la cuenta borra al usuario y ya no puede iniciar sesión', async () => {
    const { token } = await registerAndLogin(app);

    const del = await api(app).delete('/users/profile').set(bearer(token));
    const login = await loginUser(app);

    del.status.Should().Be(200);
    login.status.Should().Be(404);
  });

  it('con la cuenta eliminada, el token anterior deja de dar acceso al perfil', async () => {
    const { token } = await registerAndLogin(app);
    await api(app).delete('/users/profile').set(bearer(token));

    const res = await api(app).get('/users/profile').set(bearer(token));

    res.status.Should().Be(404);
  });
});