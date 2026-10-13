import { INestApplication } from '@nestjs/common';
import { Should } from '../src/common/fluent-assertions';
import { api, bearer, registerAndLogin } from './support/api';
import { createE2EApp } from './support/create-app';

const inHours = (hours: number) =>
  new Date(Date.now() + hours * 3_600_000).toISOString();

describe('F06 · Notificaciones de tareas próximas a vencer, 48 h (e2e backend)', () => {
  let app: INestApplication;
  let token: string;
  let subjectId: number;

  async function crearEntrega(title: string, dueDate: string, who = token) {
    return api(app)
      .post(`/assignments/subject/${subjectId}`)
      .set(bearer(who))
      .send({ title, description: 'detalle', dueDate });
  }

  beforeEach(async () => {
    app = await createE2EApp();
    ({ token } = await registerAndLogin(app));
    await api(app)
      .post('/subjects')
      .set(bearer(token))
      .send({ name: 'Cálculo', professor: 'Pérez' });
    const subjects = await api(app).get('/subjects').set(bearer(token));
    subjectId = subjects.body.data[0].id;
  });

  afterEach(async () => {
    await app.close();
  });

  it('sin entregas devuelve una lista vacía con 200', async () => {
    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    res.status.Should().Be(200);
    res.body.data.Should().BeEmpty();
  });

  it('incluye una entrega que vence en 26 horas con título y materia', async () => {
    await crearEntrega('Taller de Cálculo', inHours(26));

    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    res.body.data.Should().HaveCount(1);
    res.body.data[0].title.Should().Be('Taller de Cálculo');
    res.body.data[0].subjectName.Should().Be('Cálculo');
  });

  it('incluye una entrega que vence en 47 horas', async () => {
    await crearEntrega('Casi 48h', inHours(47));

    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    res.body.data.Should().HaveCount(1);
  });

  it('excluye una entrega que vence en 72 horas (fuera de la ventana de 48 h)', async () => {
    await crearEntrega('Lejana', inHours(72));

    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    res.body.data.Should().BeEmpty();
  });

  it('excluye una entrega cuya fecha ya pasó', async () => {
    await crearEntrega('Vencida', inHours(-30));

    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    res.body.data.Should().BeEmpty();
  });

  it('ordena las entregas de la más cercana a la más lejana', async () => {
    await crearEntrega('Segunda', inHours(40));
    await crearEntrega('Primera', inHours(26));

    const res = await api(app).get('/assignments/upcoming').set(bearer(token));

    const titulos = res.body.data.map((a: { title: string }) => a.title);
    titulos.Should().BeEquivalentTo(['Primera', 'Segunda']);
  });

  it('cada usuario solo ve sus propias entregas próximas', async () => {
    await crearEntrega('De Ana', inHours(26));
    const luis = await registerAndLogin(app, {
      name: 'Luis',
      email: 'luis@test.com',
      password: 'Otra456',
    });

    const res = await api(app)
      .get('/assignments/upcoming')
      .set(bearer(luis.token));

    res.body.data.Should().BeEmpty();
  });

  it('sin token responde 401', async () => {
    const res = await api(app).get('/assignments/upcoming');

    Should(res.status).Be(401);
  });
});