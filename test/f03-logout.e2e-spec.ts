import { INestApplication } from '@nestjs/common';
import { api, bearer, registerAndLogin } from './support/api';
import { createE2EApp } from './support/create-app';
import { Should } from '../src/common/fluent-assertions';

describe('F03 · Cerrar Sesión (e2e backend)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2EApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('el cierre de sesión es del lado del cliente: el backend no expone un endpoint de logout', async () => {
    const { token } = await registerAndLogin(app);

    const res = await api(app).post('/auth/logout').set(bearer(token));

    res.status.Should().Be(404);
  });

  it('sin token, las rutas protegidas responden 401 (estado de sesión cerrada)', async () => {
    const rutas = ['/users/profile', '/assignments', '/assignments/upcoming', '/subjects'];

    for (const ruta of rutas) {
      const res = await api(app).get(ruta);
      Should(res.status).Be(401);
    }
  });

  it('un token manipulado es rechazado con 401', async () => {
    const { token } = await registerAndLogin(app);

    const res = await api(app)
      .get('/users/profile')
      .set(bearer(`${token}x`));

    res.status.Should().Be(401);
  });

  it('un token válido sí permite acceder mientras la sesión está abierta', async () => {
    const { token } = await registerAndLogin(app);

    const res = await api(app).get('/users/profile').set(bearer(token));

    res.status.Should().Be(200);
  });
});