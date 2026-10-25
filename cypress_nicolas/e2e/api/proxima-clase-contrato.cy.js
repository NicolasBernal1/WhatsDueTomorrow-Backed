import { DAYS, computeNextClass, createClass, createSubject, getClasses } from '../../support/class-helpers';

describe('Contrato de datos para la próxima clase', () => {
  let token;
  let subject;
  const miercoles1030 = () => new Date(2026, 9, 21, 10, 30);
  before(() => {
    cy.registerAndLogin({ name: 'Alicia Proxima' }).then((auth) => { token = auth.token; });
    cy.then(() => createSubject(token, { name: `Cálculo ${Date.now()}`, professor: 'Gómez' })).then((s) => { subject = s; });
    cy.then(() => {
      createClass(token, subject.id, 'friday', '08:00', '09:00');
      createClass(token, subject.id, 'thursday', '10:00', '11:00');
      createClass(token, subject.id, 'wednesday', '16:00', '17:00');
      createClass(token, subject.id, 'wednesday', '12:00', '13:00');
    });
  });

  it('cada clase trae día válido, horas HH:mm(:ss) con inicio menor que fin, asignatura y profesor', () => {
    getClasses(token).its('body.data').then((data) => {
      expect(data).to.have.length(4);
      data.forEach((c) => {
        expect(DAYS).to.include(c.dayOfWeek.toLowerCase());
        expect(c.startTime).to.match(/^\d{2}:\d{2}(:\d{2})?$/);
        expect(c.startTime < c.endTime).to.eq(true);
        expect(c.subject.name).to.be.a('string').and.not.empty;
        expect(c.subject.professor).to.eq('Gómez');
      });
    });
  });

  it('con datos reales la próxima clase del miércoles 10:30 es la de las 12:00', () => {
    getClasses(token).its('body.data').then((data) => {
      const proxima = computeNextClass(data, miercoles1030());
      expect(proxima.dayOfWeek).to.eq('wednesday');
      expect(proxima.startTime).to.match(/^12:00/);
      expect(proxima.subject.id).to.eq(subject.id);
    });
  });

  it('pasa a mañana cuando ya terminaron las clases de hoy y salta de domingo a la semana siguiente', () => {
    getClasses(token).its('body.data').then((data) => {
      expect(computeNextClass(data, new Date(2026, 9, 21, 20, 0)).dayOfWeek).to.eq('thursday');
      expect(computeNextClass(data, new Date(2026, 9, 25, 22, 30)).startTime).to.match(/^12:00/);
    });
  });

  it('una clase que empieza justo ahora no cuenta como próxima', () => {
    getClasses(token).its('body.data').then((data) => {
      expect(computeNextClass(data, new Date(2026, 9, 21, 12, 0)).startTime).to.match(/^16:00/);
    });
  });

  it('un estudiante sin clases no tiene próxima clase', () => {
    cy.registerAndLogin({ name: 'Bruno Proxima' }).then((otro) => getClasses(otro.token)).then(({ body }) => {
      expect(body.data).to.deep.equal([]);
      expect(computeNextClass(body.data, miercoles1030())).to.eq(null);
    });
  });

  it('la lógica ignora clases con día inválido sin lanzar excepción', () => {
    const clases = [
      { id: 1, dayOfWeek: 'funday', startTime: '12:00:00', endTime: '13:00:00', subject: {} },
      { id: 2, dayOfWeek: 'thursday', startTime: '09:00:00', endTime: '10:00:00', subject: {} },
    ];
    expect(() => computeNextClass(clases, miercoles1030())).not.to.throw();
    expect(computeNextClass(clases, miercoles1030()).id).to.eq(2);
  });
});
