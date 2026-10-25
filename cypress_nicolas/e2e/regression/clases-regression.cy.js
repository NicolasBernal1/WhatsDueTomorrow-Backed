import { bearer, createClass, createSubject, deleteClass, getClasses, patchClass, postClass } from '../../support/class-helpers';

describe('Regresión: clases y asignaturas', () => {
  let token;
  let subject;
  before(() => {
    cy.registerAndLogin({ name: 'Alicia Regresion' }).then((auth) => { token = auth.token; });
    cy.then(() => createSubject(token, { name: `Cálculo ${Date.now()}`, professor: 'Gómez' })).then((s) => { subject = s; });
  });

  it('crear una clase no modifica las clases existentes', () => {
    createClass(token, subject.id, 'monday', '08:00', '09:00');
    getClasses(token).its('body.data').then((antes) => {
      postClass(token, { dayOfWeek: 'saturday', startTime: '10:00', endTime: '11:00', subjectId: subject.id }).its('status').should('eq', 201);
      getClasses(token).its('body.data').then((despues) => {
        antes.forEach((vieja) => expect(despues.find((c) => c.id === vieja.id)).to.deep.equal(vieja));
        expect(despues).to.have.length(antes.length + 1);
      });
    });
  });

  it('editar una clase no modifica sus hermanas ni la cantidad de clases', () => {
    createClass(token, subject.id, 'tuesday', '08:00', '09:00').then((editar) => {
      createClass(token, subject.id, 'wednesday', '10:00', '11:00').then((hermana) => {
        getClasses(token).its('body.data').then((antes) => {
          patchClass(token, editar.id, { dayOfWeek: 'friday', startTime: '16:00', endTime: '17:00' }).its('status').should('eq', 200);
          getClasses(token).its('body.data').then((despues) => {
            expect(despues).to.have.length(antes.length);
            expect(despues.find((c) => c.id === hermana.id)).to.deep.equal(antes.find((c) => c.id === hermana.id));
          });
        });
      });
    });
  });

  it('repetir el mismo PATCH es idempotente', () => {
    createClass(token, subject.id, 'thursday', '08:00', '09:00').then((clase) => {
      const body = { dayOfWeek: 'sunday', startTime: '09:00', endTime: '10:00' };
      patchClass(token, clase.id, body).its('status').should('eq', 200);
      getClasses(token).its('body.data').then((primera) => {
        patchClass(token, clase.id, body).its('status').should('eq', 200);
        getClasses(token).its('body.data').should('deep.equal', primera);
      });
    });
  });

  it('borrar una clase conserva la asignatura y las otras clases', () => {
    createClass(token, subject.id, 'thursday', '12:00', '13:00').then((conservar) => {
      createClass(token, subject.id, 'thursday', '14:00', '15:00').then((borrar) => {
        deleteClass(token, borrar.id).its('status').should('eq', 200);
        getClasses(token).its('body.data').then((data) => {
          expect(data.some((c) => c.id === conservar.id)).to.eq(true);
          expect(data.some((c) => c.id === borrar.id)).to.eq(false);
        });
        cy.request({ url: `/subjects/${subject.id}`, headers: bearer(token) }).its('status').should('eq', 200);
      });
    });
  });

  it('al borrar todas las clases el horario queda vacío', () => {
    cy.registerAndLogin({ name: 'Carla Regresion' }).then((carla) => {
      createSubject(carla.token, { name: `Física ${Date.now()}` }).then((s) => createClass(carla.token, s.id, 'friday', '08:00', '09:00')).then((clase) => {
        deleteClass(carla.token, clase.id).its('status').should('eq', 200);
        getClasses(carla.token).its('body.data').should('deep.equal', []);
      });
    });
  });

  it('al eliminar una asignatura sus clases desaparecen del horario (cascada)', () => {
    createSubject(token, { name: `Temporal ${Date.now()}` }).then((temporal) => {
      createClass(token, temporal.id, 'friday', '14:00', '15:00');
      cy.request({ method: 'DELETE', url: `/subjects/${temporal.id}`, headers: bearer(token) }).its('status').should('eq', 200);
      getClasses(token).its('body.data').then((data) => expect(data.filter((c) => c.subject.id === temporal.id)).to.have.length(0));
    });
  });

  it('dos estudiantes pueden tener clases con el mismo horario sin interferir', () => {
    cy.registerAndLogin({ name: 'Bruno Regresion' }).then((bruno) => {
      createSubject(bruno.token, { name: `Química ${Date.now()}` }).then((s) => {
        createClass(bruno.token, s.id, 'monday', '08:00', '09:00');
        getClasses(bruno.token).its('body.data').then((data) => expect(data.every((c) => c.subject.id === s.id)).to.eq(true));
      });
    });
  });

  it('la ruta /subjects/classes no se confunde con /subjects/:id', () => {
    cy.request({ url: '/subjects/classes', headers: bearer(token) }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data).to.be.an('array');
    });
  });
});
