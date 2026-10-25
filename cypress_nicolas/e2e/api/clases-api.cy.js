import { bearer, createClass, createSubject, deleteClass, getClasses, patchClass, postClass } from '../../support/class-helpers';

describe('API de clases: consultar, crear, editar y eliminar', () => {
  let token;
  let subject;
  before(() => {
    cy.registerAndLogin({ name: 'Alicia Clases' }).then((auth) => { token = auth.token; });
    cy.then(() => createSubject(token, { name: `Cálculo ${Date.now()}`, professor: 'Gómez', credits: 4 })).then((s) => { subject = s; });
  });
  const valida = (extra = {}) => ({ dayOfWeek: 'tuesday', startTime: '14:00', endTime: '15:00', subjectId: subject.id, ...extra });

  it('devuelve un horario vacío para un estudiante sin clases', () => {
    cy.registerAndLogin({ name: 'Bruno Clases' }).then((otro) => getClasses(otro.token)).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data).to.deep.equal([]);
    });
  });

  it('crea una clase y la devuelve en el horario con su asignatura', () => {
    postClass(token, valida()).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq('Class created successfully');
    });
    getClasses(token).then(({ status, body }) => {
      expect(status).to.eq(200);
      const clase = body.data.find((c) => c.subject.id === subject.id && c.dayOfWeek === 'tuesday');
      expect(clase).to.have.all.keys('id', 'dayOfWeek', 'startTime', 'endTime', 'subject');
      expect(clase.subject).to.include({ id: subject.id, professor: 'Gómez' });
      expect(clase.startTime).to.match(/^14:00(:00)?$/);
    });
  });

  it('permite varias clases en la misma asignatura', () => {
    ['monday', 'wednesday', 'friday'].forEach((dia) => postClass(token, valida({ dayOfWeek: dia, startTime: '08:00', endTime: '09:00' })).its('status').should('eq', 201));
    getClasses(token).its('body.data').then((data) => expect(data.filter((c) => c.subject.id === subject.id).length).to.be.gte(4));
  });

  ['dayOfWeek', 'startTime', 'endTime', 'subjectId'].forEach((campo) => {
    it(`rechaza crear una clase sin ${campo}`, () => {
      const body = valida();
      delete body[campo];
      postClass(token, body).its('status').should('eq', 400);
    });
  });

  it('responde 404 al crear una clase en una asignatura inexistente', () => {
    postClass(token, valida({ subjectId: 999999999 })).then(({ status, body }) => {
      expect(status).to.eq(404);
      expect(body.message).to.eq('The subject does not exist');
    });
  });

  it('responde 409 cuando la hora de fin es anterior a la de inicio', () => {
    postClass(token, valida({ startTime: '15:00', endTime: '14:00' })).its('status').should('eq', 409);
  });

  it('edita día y horario y el cambio se refleja en el horario', () => {
    createClass(token, subject.id, 'saturday', '09:00', '10:00').then((clase) => {
      patchClass(token, clase.id, { dayOfWeek: 'thursday', startTime: '14:00', endTime: '15:00' }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.message).to.eq('Class updated successfully');
      });
      getClasses(token).its('body.data').then((data) => {
        const editada = data.find((c) => c.id === clase.id);
        expect(editada.dayOfWeek).to.eq('thursday');
        expect(editada.startTime).to.match(/^14:00/);
        expect(editada.subject.id).to.eq(subject.id);
      });
    });
  });

  it('rechaza editar con un id inexistente, no numérico o con campos faltantes', () => {
    patchClass(token, 999999999, { dayOfWeek: 'monday', startTime: '08:00', endTime: '09:00' }).its('status').should('eq', 404);
    cy.request({ method: 'PATCH', url: '/subjects/classes/abc', headers: bearer(token), body: {}, failOnStatusCode: false }).its('status').should('eq', 400);
    createClass(token, subject.id, 'sunday', '09:00', '10:00').then((clase) => patchClass(token, clase.id, { dayOfWeek: 'monday' }).its('status').should('eq', 400));
  });

  it('elimina una clase propia y no puede eliminarla dos veces', () => {
    createClass(token, subject.id, 'sunday', '12:00', '13:00').then((clase) => {
      deleteClass(token, clase.id).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.message).to.eq('Class deleted successfully');
      });
      getClasses(token).its('body.data').then((data) => expect(data.some((c) => c.id === clase.id)).to.eq(false));
      deleteClass(token, clase.id).its('status').should('eq', 404);
    });
  });

  it('responde 404 o 400 al eliminar un id inexistente o no numérico', () => {
    deleteClass(token, 999999999).its('status').should('eq', 404);
    cy.request({ method: 'DELETE', url: '/subjects/classes/abc', headers: bearer(token), failOnStatusCode: false }).its('status').should('eq', 400);
  });

  it('devuelve los detalles de la asignatura de una clase', () => {
    getClasses(token).its('body.data').then((data) => {
      const clase = data.find((c) => c.subject.id === subject.id);
      cy.request({ url: `/subjects/${clase.subject.id}`, headers: bearer(token) }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data).to.have.all.keys('id', 'name', 'professor', 'color', 'credits');
        expect(body.data).to.include({ id: subject.id, name: clase.subject.name, professor: 'Gómez', credits: 4 });
      });
    });
  });

  it('rechaza los detalles de una asignatura inexistente o con id no numérico', () => {
    cy.request({ url: '/subjects/999999999', headers: bearer(token), failOnStatusCode: false }).then(({ status, body }) => {
      expect(status).to.eq(404);
      expect(body.message).to.eq('The subject does not exist');
    });
    cy.request({ url: '/subjects/NaN', headers: bearer(token), failOnStatusCode: false }).its('status').should('eq', 400);
  });
});
