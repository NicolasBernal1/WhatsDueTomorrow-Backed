import { apiBudget, bearer, createClass, createSubject, deleteClass, getClasses, patchClass, postClass } from '../../support/class-helpers';

describe('Rendimiento de la API de clases', () => {
  let token;
  let subject;
  let clase;
  before(() => {
    cy.registerAndLogin({ name: 'Alicia Rendimiento' }).then((auth) => { token = auth.token; });
    cy.then(() => createSubject(token, { name: `Cálculo ${Date.now()}`, professor: 'Gómez' })).then((s) => { subject = s; });
    cy.then(() => createClass(token, subject.id, 'monday', '08:00', '09:00')).then((c) => { clase = c; });
    cy.request({ url: '/subjects/classes', headers: bearer(token) }); // calienta el servidor
  });
  const promedio = (tiempos) => tiempos.reduce((a, b) => a + b, 0) / tiempos.length;

  it('GET /subjects/classes responde dentro del presupuesto', () => {
    getClasses(token).then(({ status, duration }) => {
      expect(status).to.eq(200);
      expect(duration).to.be.lessThan(apiBudget());
    });
  });

  it('GET /subjects/:id responde dentro del presupuesto', () => {
    cy.request({ url: `/subjects/${subject.id}`, headers: bearer(token) }).then(({ status, duration }) => {
      expect(status).to.eq(200);
      expect(duration).to.be.lessThan(apiBudget());
    });
  });

  it('POST /subjects/classes responde dentro del presupuesto', () => {
    postClass(token, { dayOfWeek: 'saturday', startTime: '18:00', endTime: '19:00', subjectId: subject.id }).then(({ status, duration }) => {
      expect(status).to.eq(201);
      expect(duration).to.be.lessThan(apiBudget());
    });
  });

  it('PATCH /subjects/classes/:id responde dentro del presupuesto', () => {
    patchClass(token, clase.id, { dayOfWeek: 'monday', startTime: '08:00', endTime: '09:00' }).then(({ status, duration }) => {
      expect(status).to.eq(200);
      expect(duration).to.be.lessThan(apiBudget());
    });
  });

  it('DELETE /subjects/classes/:id responde dentro del presupuesto', () => {
    createClass(token, subject.id, 'sunday', '08:00', '09:00').then((c) => {
      deleteClass(token, c.id).then(({ status, duration }) => {
        expect(status).to.eq(200);
        expect(duration).to.be.lessThan(apiBudget());
      });
    });
  });

  it('cinco consultas consecutivas tienen un promedio dentro del presupuesto', () => {
    const tiempos = [];
    for (let i = 0; i < 5; i++) getClasses(token).then(({ status, duration }) => { expect(status).to.eq(200); tiempos.push(duration); });
    cy.then(() => expect(promedio(tiempos)).to.be.lessThan(apiBudget()));
  });

  it('cinco altas consecutivas tienen un promedio dentro del presupuesto', () => {
    const tiempos = [];
    ['06', '07', '08', '09', '10'].forEach((h) => {
      postClass(token, { dayOfWeek: 'sunday', startTime: `${h}:00`, endTime: `${String(Number(h) + 1).padStart(2, '0')}:00`, subjectId: subject.id })
        .then(({ status, duration }) => { expect(status).to.eq(201); tiempos.push(duration); });
    });
    cy.then(() => expect(promedio(tiempos)).to.be.lessThan(apiBudget()));
  });
});
