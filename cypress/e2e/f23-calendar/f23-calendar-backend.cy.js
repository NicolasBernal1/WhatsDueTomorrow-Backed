describe('F23: Sincronización y Exportación de Calendario .ics (Backend API & Seguridad)', () => {
  let userTokenA;
  let userTokenC;
  let subjectId;
  let generatedToken;

  before(() => {
    // 1. Registrar y autenticar Usuario A con materia y entrega
    cy.registerAndLogin({ name: 'Usuario Calendario' }).then(({ token }) => {
      userTokenA = token;

      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: {
          name: 'Cálculo Vectorial',
          professor: 'Profesor Gauss',
        },
      }).then((subRes) => {
        expect(subRes.status).to.be.oneOf([200, 201]);

        cy.request({
          method: 'GET',
          url: '/subjects',
          headers: { Authorization: `Bearer ${userTokenA}` },
        }).then((listRes) => {
          subjectId = listRes.body.data[0].id;

          // Crear entrega para poblar el calendario
          cy.request({
            method: 'POST',
            url: `/assignments/subject/${subjectId}`,
            headers: { Authorization: `Bearer ${userTokenA}` },
            body: {
              title: 'Taller de Integrales Múltiples',
              description: 'Ejercicios del capítulo 14',
              dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            },
          });
        });
      });
    });

    // 2. Registrar Usuario C (sin materias ni entregas para prueba de 0 eventos)
    cy.registerAndLogin({ name: 'Usuario Sin Clases' }).then(({ token }) => {
      userTokenC = token;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Descarga de Archivo .ics y Conformidad RFC 5545
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería generar y descargar archivo .ics con cabeceras y bloques RFC 5545 válidos', () => {
    cy.request({
      method: 'GET',
      url: '/calendar/download',
      headers: { Authorization: `Bearer ${userTokenA}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('text/calendar');
      expect(response.headers['content-disposition']).to.include('whats-due-tomorrow.ics');

      const body = response.body;
      expect(body).to.include('BEGIN:VCALENDAR');
      expect(body).to.include('VERSION:2.0');
      expect(body).to.include('PRODID:-//Whats Due Tomorrow//Academic Calendar//EN');
      expect(body).to.include('CALSCALE:GREGORIAN');
      expect(body).to.include('BEGIN:VEVENT');
      expect(body).to.include('Taller de Integrales Múltiples');
      expect(body).to.include('END:VEVENT');
      expect(body).to.include('END:VCALENDAR');
      expect(body).to.include('\r\n');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO ALTERNATIVO: Generación y Consulta de Feed Webcal Idempotente
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: Debería crear enlace de suscripción webcal y permitir consulta pública del feed con token', () => {
    // Generar o recuperar token de suscripción
    cy.request({
      method: 'POST',
      url: '/calendar/subscription',
      headers: { Authorization: `Bearer ${userTokenA}` },
    }).then((subRes) => {
      expect(subRes.status).to.be.oneOf([200, 201]);
      expect(subRes.body.data).to.have.property('webcalUrl');
      const webcalUrl = subRes.body.data.webcalUrl;
      expect(webcalUrl).to.match(/^webcal:\/\//);
      expect(webcalUrl).to.include('.ics');

      // Extraer el token de la URL
      const match = webcalUrl.match(/\/calendar\/feed\/([a-f0-9]+)\.ics$/i);
      expect(match).to.exist;
      generatedToken = match[1];

      // Segunda llamada para verificar idempotencia (debe retornar el mismo feed)
      cy.request({
        method: 'POST',
        url: '/calendar/subscription',
        headers: { Authorization: `Bearer ${userTokenA}` },
      }).then((subRes2) => {
        expect(subRes2.status).to.be.oneOf([200, 201]);
        expect(subRes2.body.data.webcalUrl).to.eq(webcalUrl);

        // Consultar el feed público sin cabecera Authorization
        cy.request({
          method: 'GET',
          url: `/calendar/feed/${generatedToken}.ics`,
        }).then((feedRes) => {
          expect(feedRes.status).to.eq(200);
          expect(feedRes.headers['content-type']).to.include('text/calendar');
          expect(feedRes.body).to.include('BEGIN:VCALENDAR');
          expect(feedRes.body).to.include('END:VCALENDAR');
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO DE SEGURIDAD: Rechazo de Feed con Token Inexistente (404)
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería responder 404 Not Found ante solicitudes de feed con tokens inválidos', () => {
    cy.request({
      method: 'GET',
      url: '/calendar/feed/tokeninvalido1234567890abcdef.ics',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.message).to.eq('Calendar feed not found');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE SEGURIDAD: Protección de Endpoint Privado de Descarga (401)
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería denegar acceso no autenticado a /calendar/download con 401 Unauthorized', () => {
    cy.request({
      method: 'GET',
      url: '/calendar/download',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE REGRESIÓN: Usuario sin Eventos Genera Calendario Válido
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería generar un iCalendar válido con 0 eventos cuando el usuario no tiene registros', () => {
    cy.request({
      method: 'GET',
      url: '/calendar/download',
      headers: { Authorization: `Bearer ${userTokenC}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include('BEGIN:VCALENDAR');
      expect(response.body).to.include('END:VCALENDAR');
      // No debe contener bloques VEVENT
      expect(response.body).to.not.include('BEGIN:VEVENT');
    });
  });
});
