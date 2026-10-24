describe('F21: Alertas y Radar de Entregas Urgentes (Backend API & Seguridad)', () => {
  let authToken;
  let testUser;
  let subjectId;

  const inHours = (hours) =>
    new Date(Date.now() + hours * 3600 * 1000).toISOString();

  before(() => {
    // Autenticar y preparar contexto inicial
    cy.registerAndLogin().then(({ token, user }) => {
      authToken = token;
      testUser = user;

      // Crear una asignatura base para asociar entregas
      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Arquitectura de Software',
          professor: 'Profesor Cypress',
        },
      }).then((subjectRes) => {
        expect(subjectRes.status).to.be.oneOf([200, 201]);
        // Obtener el ID de la asignatura creada
        cy.request({
          method: 'GET',
          url: '/subjects',
          headers: { Authorization: `Bearer ${authToken}` },
        }).then((listRes) => {
          subjectId = listRes.body.data[0].id;
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Consulta de Entregas Urgentes (API / Contrato)
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería listar entregas urgentes dentro de la ventana de tiempo (Status 200)', () => {
    const urgentDueDate = inHours(18); // Vence en 18 horas (dentro de las 24/48h)

    // Crear entrega urgente
    cy.request({
      method: 'POST',
      url: `/assignments/subject/${subjectId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Taller Urgente Radar F21',
        description: 'Entrega para validación de radar',
        dueDate: urgentDueDate,
      },
    }).then((createRes) => {
      expect(createRes.status).to.be.oneOf([200, 201]);

      // Consultar radar de entregas próximas
      cy.request({
        method: 'GET',
        url: '/assignments/upcoming',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
        expect(response.body.data.length).to.be.greaterThan(0);

        const found = response.body.data.find(
          (item) => item.title === 'Taller Urgente Radar F21'
        );
        expect(found).to.exist;
        expect(found.subjectName).to.eq('Arquitectura de Software');
        expect(found).to.have.property('dueDate');
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO ALTERNATIVO: Ventana Temporal y Entregas Fuera de Rango (Regresión)
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: No debería incluir entregas con vencimiento lejano (> 48h) en el radar', () => {
    const distantDueDate = inHours(96); // Vence en 4 días

    cy.request({
      method: 'POST',
      url: `/assignments/subject/${subjectId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Proyecto Final Lejano',
        description: 'No debe aparecer en radar urgente',
        dueDate: distantDueDate,
      },
    }).then((createRes) => {
      expect(createRes.status).to.be.oneOf([200, 201]);

      cy.request({
        method: 'GET',
        url: '/assignments/upcoming',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const shouldNotExist = response.body.data.find(
          (item) => item.title === 'Proyecto Final Lejano'
        );
        expect(shouldNotExist).to.be.undefined;
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO DE ERROR: Protección de Autenticación y Token Faltante (Seguridad)
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería rechazar consultas al radar sin token de autenticación (Status 401)', () => {
    cy.request({
      method: 'GET',
      url: '/assignments/upcoming',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.be.oneOf([
        'Unauthorized',
        'No token provided',
      ]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE SEGURIDAD: Sanitización de Contenido y Prevención XSS
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería manejar de forma segura títulos con etiquetas HTML o scripts maliciosos', () => {
    const xssTitle = '<script>alert("xss")</script><b>Entrega Crítica</b>';

    cy.request({
      method: 'POST',
      url: `/assignments/subject/${subjectId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: xssTitle,
        description: 'Verificación de payload seguro',
        dueDate: inHours(10),
      },
      failOnStatusCode: false,
    }).then((res) => {
      // Debe aceptar como texto plano o rechazar con 400 Bad Request
      expect(res.status).to.be.oneOf([200, 201, 400]);

      if (res.status === 200 || res.status === 201) {
        cy.request({
          method: 'GET',
          url: '/assignments/upcoming',
          headers: { Authorization: `Bearer ${authToken}` },
        }).then((radarRes) => {
          expect(radarRes.status).to.eq(200);
          const item = radarRes.body.data.find((a) => a.title.includes('Entrega Crítica'));
          expect(item).to.exist;
          // Validar que se conserve como string seguro en el contrato JSON
          expect(typeof item.title).to.eq('string');
        });
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE REGRESIÓN: Disparo de Recordatorios (Idempotencia / Reminders)
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería procesar el trigger de recordatorios sin degradar el servidor', () => {
    cy.request({
      method: 'POST',
      url: '/reminders/trigger',
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    }).then((response) => {
      // Debe responder con 200 o 201 y mensaje de ejecución
      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('status');
      expect(response.body).to.have.property('message');
    });
  });
});
