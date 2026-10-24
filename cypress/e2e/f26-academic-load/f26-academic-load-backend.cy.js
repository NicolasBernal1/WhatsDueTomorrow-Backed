/// <reference types="cypress" />

describe('F26: Gestión de Créditos Académicos y Semáforo de Carga Semanal (Backend API & Seguridad)', () => {
  let userTokenA;
  let userA;
  let userTokenB;
  let userB;

  before(() => {
    // 1. Registrar e iniciar sesión como Usuario A
    cy.registerAndLogin({ name: 'Estudiante Creditos Uno' }).then((authA) => {
      userTokenA = authA.token;
      userA = authA.user;
    });

    // 2. Registrar e iniciar sesión como Usuario B (Usuario nuevo sin materias inscritas)
    cy.registerAndLogin({ name: 'Estudiante Creditos Dos' }).then((authB) => {
      userTokenB = authB.token;
      userB = authB.user;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Cálculo de Carga Balanceada (12 a 18 Créditos)
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería calcular la carga como "balanceada" cuando los créditos acumulados están entre 12 y 18', () => {
    // Inscribir 3 materias para Usuario A: 5 + 5 + 5 = 15 créditos
    const subjectsToCreate = [
      { name: 'Cálculo Vectorial', professor: 'Prof. Gauss', credits: 5 },
      { name: 'Estructuras de Datos', professor: 'Prof. Knuth', credits: 5 },
      { name: 'Física Electromagnética', professor: 'Prof. Maxwell', credits: 5 },
    ];

    subjectsToCreate.forEach((subject) => {
      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: subject,
      }).then((res) => {
        expect(res.status).to.be.oneOf([200, 201]);
      });
    });

    // Consultar el resumen de carga semanal
    cy.request({
      method: 'GET',
      url: '/subjects/academic-load',
      headers: { Authorization: `Bearer ${userTokenA}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data');
      const load = res.body.data;

      expect(load.totalCredits).to.eq(15);
      expect(load.status).to.eq('balanceada');
      expect(load.statusLabel).to.eq('Carga balanceada');
      expect(load.subjectsCount).to.eq(3);
      expect(load).to.have.property('weeklyPresentialHours');
      expect(load).to.have.property('weeklyAutonomousHours');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO ALTERNATIVO: Transición Dinámica a Sobrecarga (> 18 Créditos)
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: Debería transicionar el semáforo a "sobrecarga" cuando los créditos superan 18', () => {
    // Añadir una materia de 5 créditos adicionales: 15 + 5 = 20 créditos
    cy.request({
      method: 'POST',
      url: '/subjects',
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Arquitectura de Computadores',
        professor: 'Prof. Turing',
        credits: 5,
      },
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);

      // Consultar la carga actualizada
      cy.request({
        method: 'GET',
        url: '/subjects/academic-load',
        headers: { Authorization: `Bearer ${userTokenA}` },
      }).then((loadRes) => {
        expect(loadRes.status).to.eq(200);
        const load = loadRes.body.data;

        expect(load.totalCredits).to.eq(20);
        expect(load.status).to.eq('sobrecarga');
        expect(load.statusLabel).to.eq('Sobrecarga');
        expect(load.subjectsCount).to.eq(4);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO ALTERNATIVO: Carga Baja o Sin Asignaturas (< 12 Créditos)
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería clasificar como "baja" con 0 créditos para un estudiante sin asignaturas', () => {
    cy.request({
      method: 'GET',
      url: '/subjects/academic-load',
      headers: { Authorization: `Bearer ${userTokenB}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      const load = res.body.data;

      expect(load.totalCredits).to.eq(0);
      expect(load.status).to.eq('baja');
      expect(load.statusLabel).to.eq('Carga baja');
      expect(load.subjectsCount).to.eq(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE SEGURIDAD: Protección de Ruta con JWT (AuthGuard)
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería denegar acceso con 401 Unauthorized ante peticiones sin token JWT', () => {
    cy.request({
      method: 'GET',
      url: '/subjects/academic-load',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE ERROR: Validación de Límites de Créditos por Asignatura [1, 12]
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería rechazar con 400 asignaturas con créditos menores a 1 o mayores a 12', () => {
    // Créditos mayores a 12
    cy.request({
      method: 'POST',
      url: '/subjects',
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Materia Ilegal Créditos Altos',
        professor: 'Prof. Hacker',
        credits: 15,
      },
      failOnStatusCode: false,
    }).then((highRes) => {
      expect(highRes.status).to.eq(400);
    });

    // Créditos menores a 1 (ej. 0 o negativos)
    cy.request({
      method: 'POST',
      url: '/subjects',
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        name: 'Materia Ilegal Créditos Cero',
        professor: 'Prof. Hacker',
        credits: 0,
      },
      failOnStatusCode: false,
    }).then((zeroRes) => {
      expect(zeroRes.status).to.eq(400);
    });
  });
});
