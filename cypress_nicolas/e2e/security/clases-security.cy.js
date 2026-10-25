import { bearer, createClass, createSubject, deleteClass, getClasses, knownBug, patchClass, postClass } from '../../support/class-helpers';

describe('Comprobaciones básicas de acceso y aislamiento de clases', () => {
  let tokenA;
  let tokenB;
  let subjectA;
  let subjectB;
  let claseA;
  before(() => {
    cy.registerAndLogin({ name: 'Alicia Seguridad' }).then((auth) => { tokenA = auth.token; });
    cy.registerAndLogin({ name: 'Bruno Seguridad' }).then((auth) => { tokenB = auth.token; });
    cy.then(() => createSubject(tokenA, { name: `Cálculo ${Date.now()}`, professor: 'Gómez' })).then((s) => { subjectA = s; });
    cy.then(() => createSubject(tokenB, { name: `Química ${Date.now()}`, professor: 'Pérez' })).then((s) => { subjectB = s; });
    cy.then(() => createClass(tokenA, subjectA.id, 'wednesday', '10:00', '11:00')).then((c) => { claseA = c; });
  });
  const cuerpo = { dayOfWeek: 'monday', startTime: '08:00', endTime: '09:00' };

  [
    ['GET', '/subjects/classes'],
    ['POST', '/subjects/classes'],
    ['PATCH', '/subjects/classes/1'],
    ['DELETE', '/subjects/classes/1'],
    ['GET', '/subjects/1'],
  ].forEach(([method, url]) => {
    it(`rechaza ${method} ${url} sin token y con token inválido`, () => {
      cy.request({ method, url, body: cuerpo, failOnStatusCode: false }).its('status').should('eq', 401);
      cy.request({ method, url, body: cuerpo, headers: bearer('token.falso.123'), failOnStatusCode: false }).its('status').should('eq', 401);
    });
  });

  it('rechaza un JWT bien formado pero firmado con otro secreto', () => {
    const falso = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoieEB4LmNvbSJ9.firma-invalida';
    cy.request({ url: '/subjects/classes', headers: bearer(falso), failOnStatusCode: false }).its('status').should('eq', 401);
  });

  it('no muestra al estudiante B las clases de A, ni con ?userId=', () => {
    getClasses(tokenB).its('body.data').then((data) => expect(data.some((c) => c.id === claseA.id)).to.eq(false));
    cy.request({ url: '/subjects/classes?userId=1', headers: bearer(tokenB) }).its('body.data').then((data) => expect(data.some((c) => c.id === claseA.id)).to.eq(false));
  });

  it('no expone al dueño ni contraseñas en clases ni en asignaturas', () => {
    getClasses(tokenA).then(({ body }) => {
      expect(JSON.stringify(body).toLowerCase()).not.to.include('password');
      body.data.forEach((c) => expect(c).not.to.have.property('user'));
    });
    cy.request({ url: `/subjects/${subjectA.id}`, headers: bearer(tokenA) }).then(({ body }) => {
      expect(JSON.stringify(body).toLowerCase()).not.to.include('password');
      expect(body.data).not.to.have.property('user');
    });
  });

  it('rechaza campos no permitidos (userId, id, subjectId en PATCH) por la lista blanca', () => {
    postClass(tokenA, { ...cuerpo, subjectId: subjectA.id, userId: 1 }).its('status').should('eq', 400);
    postClass(tokenA, { ...cuerpo, subjectId: subjectA.id, id: 1 }).its('status').should('eq', 400);
    patchClass(tokenA, claseA.id, { ...cuerpo, subjectId: 1 }).its('status').should('eq', 400);
  });

  it('no permite que B borre la clase de A y la clase sigue existiendo', () => {
    deleteClass(tokenB, claseA.id).its('status').should('eq', 404);
    getClasses(tokenA).its('body.data').then((data) => expect(data.some((c) => c.id === claseA.id)).to.eq(true));
  });

  it('una inyección SQL en dayOfWeek o en el id no provoca un error 500', () => {
    postClass(tokenA, { dayOfWeek: "monday'; DROP TABLE subject_class;--", startTime: '06:00', endTime: '07:00', subjectId: subjectA.id }).its('status').should('be.lessThan', 500);
    patchClass(tokenA, claseA.id, { dayOfWeek: "x' OR '1'='1", startTime: '10:00', endTime: '11:00' }).its('status').should('be.lessThan', 500);
    cy.request({ method: 'DELETE', url: '/subjects/classes/1%20OR%201=1', headers: bearer(tokenA), failOnStatusCode: false }).its('status').should('eq', 400);
    cy.request({ url: '/subjects/1%20OR%201=1', headers: bearer(tokenA), failOnStatusCode: false }).its('status').should('eq', 400);
    getClasses(tokenA).its('status').should('eq', 200);
  });

  it('responde en JSON', () => {
    getClasses(tokenA).its('headers.content-type').should('include', 'application/json');
  });

  knownBug('B no debe poder editar la clase de A (esperado 403/404)', () => {
    patchClass(tokenB, claseA.id, { dayOfWeek: 'sunday', startTime: '06:00', endTime: '07:00' }).its('status').should('be.oneOf', [403, 404]);
    getClasses(tokenA).its('body.data').then((data) => expect(data.find((c) => c.id === claseA.id).dayOfWeek).to.eq('wednesday'));
  });
  knownBug('A no debe ver los detalles de la asignatura de B (esperado 403/404)', () => {
    cy.request({ url: `/subjects/${subjectB.id}`, headers: bearer(tokenA), failOnStatusCode: false }).its('status').should('be.oneOf', [403, 404]);
  });
  knownBug('A no debe poder crear clases en la asignatura de B (esperado 403/404)', () => {
    postClass(tokenA, { dayOfWeek: 'thursday', startTime: '06:00', endTime: '07:00', subjectId: subjectB.id }).its('status').should('be.oneOf', [403, 404]);
  });
  knownBug('una clase con fin igual al inicio debe rechazarse al crear (400/409)', () => {
    postClass(tokenA, { dayOfWeek: 'thursday', startTime: '12:00', endTime: '12:00', subjectId: subjectA.id }).its('status').should('be.oneOf', [400, 409]);
  });
  knownBug('editar con fin anterior al inicio debe rechazarse (400/409)', () => {
    patchClass(tokenA, claseA.id, { dayOfWeek: 'wednesday', startTime: '15:00', endTime: '14:00' }).its('status').should('be.oneOf', [400, 409]);
  });
  knownBug('un día inválido ("funday") debe rechazarse con 400', () => {
    postClass(tokenA, { dayOfWeek: 'funday', startTime: '16:00', endTime: '17:00', subjectId: subjectA.id }).its('status').should('eq', 400);
  });
  knownBug('una hora inválida ("abc") debe responder 400 y no un error 500', () => {
    postClass(tokenA, { dayOfWeek: 'thursday', startTime: 'abc', endTime: 'xyz', subjectId: subjectA.id }).its('status').should('eq', 400);
  });
  knownBug('el backend debe rechazar (409) una clase que se cruza con otra del mismo estudiante', () => {
    postClass(tokenA, { dayOfWeek: 'wednesday', startTime: '10:00', endTime: '11:00', subjectId: subjectA.id }).its('status').should('eq', 409);
  });
});
