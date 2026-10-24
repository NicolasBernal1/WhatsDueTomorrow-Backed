/// <reference types="cypress" />

describe('F25: Calculadora y Simulador de Calificaciones por Asignatura (Backend API & Seguridad)', () => {
  let userTokenA;
  let userA;
  let userTokenB;
  let userB;
  let subjectId;

  before(() => {
    // 1. Registrar e iniciar sesión como Usuario A (Propietario legítimo)
    cy.registerAndLogin({ name: 'Estudiante Calculadora Uno' }).then((authA) => {
      userTokenA = authA.token;
      userA = authA.user;

      // 2. Crear una materia asignada al Usuario A
      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: {
          name: 'Física de Oscilaciones y Ondas',
          professor: 'Dra. Curie',
        },
      }).then((subRes) => {
        expect(subRes.status).to.be.oneOf([200, 201]);

        cy.request({
          method: 'GET',
          url: '/subjects',
          headers: { Authorization: `Bearer ${userTokenA}` },
        }).then((listRes) => {
          expect(listRes.status).to.eq(200);
          expect(listRes.body.data.length).to.be.greaterThan(0);
          subjectId = listRes.body.data[0].id;
        });
      });
    });

    // 3. Registrar e iniciar sesión como Usuario B (Atacante para pruebas Anti-IDOR)
    cy.registerAndLogin({ name: 'Estudiante Atacante Notas Dos' }).then((authB) => {
      userTokenB = authB.token;
      userB = authB.user;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Registro de Evaluación y Cálculo Ponderado Inicial
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería registrar una evaluación y calcular el promedio acumulado con precisión matemática', () => {
    const payload = {
      name: 'Primer Examen Parcial',
      weight: 30,
      score: 4.5,
    };

    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: payload,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.have.property('data');
      const { evaluations, summary } = res.body.data;

      expect(evaluations).to.be.an('array');
      expect(evaluations.length).to.be.at.least(1);

      const created = evaluations.find((e) => e.name === payload.name);
      expect(created).to.exist;
      expect(created.weight).to.eq(payload.weight);
      expect(created.score).to.eq(payload.score);

      // Verificación de invariantes aritméticos (round2 y IEEE 754)
      expect(summary.totalWeight).to.eq(30);
      expect(summary.remainingWeight).to.eq(70);
      expect(summary.currentContribution).to.eq(1.35); // 4.5 * 30 / 100
      expect(summary.currentAverage).to.eq(4.5);
      expect(summary.status).to.eq('Aprobando');
      expect(summary.isPassing).to.be.true;
      expect(summary.isAttainable).to.be.true;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO ALTERNATIVO: Transición a 'Aprobado' y Simulación de Meta
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: Debería transicionar a "Aprobado" al superar 3.0 acumulado y simular metas hipotéticas', () => {
    // Añadir segunda nota con 40% y 5.0 -> aporte = 1.35 + 2.0 = 3.35 (supera 3.0 de pase)
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Segundo Examen Parcial',
        weight: 40,
        score: 5.0,
      },
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      const summary = res.body.data.summary;

      expect(summary.totalWeight).to.eq(70);
      expect(summary.remainingWeight).to.eq(30);
      expect(summary.currentContribution).to.eq(3.35);
      expect(summary.status).to.eq('Aprobado');
      expect(summary.requiredGrade).to.eq(0.0);

      // Simular con meta de excelencia (targetGrade = 4.2)
      cy.request({
        method: 'POST',
        url: `/subjects/${subjectId}/evaluations/simulate`,
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: {
          targetGrade: 4.2,
          hypotheticalScore: 4.0,
        },
      }).then((simRes) => {
        expect(simRes.status).to.be.oneOf([200, 201]);
        const simData = simRes.body.data;

        expect(simData).to.have.property('requiredForTarget');
        expect(simData).to.have.property('isTargetAttainable');
        expect(simData.isTargetAttainable).to.be.true;
        expect(simData.hypotheticalScore).to.eq(4.0);
        // aporte hipotético = 3.35 + (4.0 * 30)/100 = 3.35 + 1.2 = 4.55
        expect(simData.hypotheticalFinalGrade).to.eq(4.55);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO DE SEGURIDAD: Aislamiento Multiusuario y Control de Acceso (Anti-IDOR)
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería denegar acceso (403/404) a un usuario que intenta leer o alterar notas de otro', () => {
    // Usuario B (Atacante) intenta leer evaluaciones de la materia del Usuario A
    cy.request({
      method: 'GET',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      failOnStatusCode: false,
    }).then((getRes) => {
      expect(getRes.status).to.be.oneOf([403, 404]);
    });

    // Usuario B intenta inyectar una evaluación fraudulenta
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      body: {
        name: 'Nota Foránea Fraudulenta',
        weight: 10,
        score: 5.0,
      },
      failOnStatusCode: false,
    }).then((postRes) => {
      expect(postRes.status).to.be.oneOf([403, 404]);
    });

    // Usuario B intenta invocar el simulador sobre la materia ajena
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations/simulate`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      body: {
        targetGrade: 3.5,
      },
      failOnStatusCode: false,
    }).then((simRes) => {
      expect(simRes.status).to.be.oneOf([403, 404]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE ERROR: Validación de Rangos de Notas [0, 5] y Pesos [1, 100]
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería rechazar con 400 calificaciones o porcentajes fuera de los límites permitidos', () => {
    // Nota superior a 5.0
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Nota Excedida',
        weight: 15,
        score: 5.5,
      },
      failOnStatusCode: false,
    }).then((scoreHighRes) => {
      expect(scoreHighRes.status).to.eq(400);
    });

    // Nota negativa
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Nota Negativa',
        weight: 15,
        score: -0.5,
      },
      failOnStatusCode: false,
    }).then((scoreLowRes) => {
      expect(scoreLowRes.status).to.eq(400);
    });

    // Peso superior a 100%
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Peso Excesivo',
        weight: 120,
        score: 4.0,
      },
      failOnStatusCode: false,
    }).then((weightHighRes) => {
      expect(weightHighRes.status).to.eq(400);
    });

    // Peso igual a 0%
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Peso Cero',
        weight: 0,
        score: 4.0,
      },
      failOnStatusCode: false,
    }).then((weightZeroRes) => {
      expect(weightZeroRes.status).to.eq(400);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE ERROR: Nombre Vacío y Materia Inexistente
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería responder con 400 ante nombre en blanco y 404 ante materia inexistente', () => {
    // Nombre vacío o puros espacios
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/evaluations`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: '     ',
        weight: 10,
        score: 4.0,
      },
      failOnStatusCode: false,
    }).then((emptyNameRes) => {
      expect(emptyNameRes.status).to.eq(400);
    });

    // Consulta de evaluaciones de materia inexistente
    cy.request({
      method: 'GET',
      url: '/subjects/999999/evaluations',
      headers: { Authorization: `Bearer ${userTokenA}` },
      failOnStatusCode: false,
    }).then((notFoundRes) => {
      expect(notFoundRes.status).to.be.oneOf([403, 404]);
    });
  });
});
