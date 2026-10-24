/// <reference types="cypress" />

describe('F24: Bitácora de Apuntes y Recursos Rápidos por Asignatura (Backend API & Seguridad)', () => {
  let userTokenA;
  let userA;
  let userTokenB;
  let userB;
  let subjectId;
  let createdNoteId;

  before(() => {
    // 1. Registrar e iniciar sesión como Usuario A (Propietario legítimo)
    cy.registerAndLogin({ name: 'Estudiante Notas Uno' }).then((authA) => {
      userTokenA = authA.token;
      userA = authA.user;

      // 2. Crear una materia asignada al Usuario A
      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: {
          name: 'Cálculo Multivariable y Vectorial',
          professor: 'Dr. Gauss',
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
    cy.registerAndLogin({ name: 'Estudiante Atacante Notas' }).then((authB) => {
      userTokenB = authB.token;
      userB = authB.user;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Creación de Apunte y Recurso con URL Segura (HTTP/HTTPS)
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería crear un apunte con título, contenido y URL válida (HTTP/HTTPS)', () => {
    const payload = {
      title: 'Fórmulas de Gradiente y Rotacional',
      content: 'El gradiente apunta en la dirección de máxima tasa de aumento de una función escalar.',
      linkUrl: 'https://ocw.mit.edu/courses/mathematics/gradient-notes',
    };

    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: payload,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 201]);
      expect(res.body).to.have.property('data');
      const note = res.body.data;
      expect(note).to.have.property('id');
      expect(note.title).to.eq(payload.title);
      expect(note.content).to.eq(payload.content);
      expect(note.linkUrl).to.eq(payload.linkUrl);
      expect(note.subjectId).to.eq(subjectId);

      createdNoteId = note.id;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO DE REGRESIÓN: Orden Cronológico Descendente y Consulta de Bitácora
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: Debería listar los apuntes ordenados cronológicamente de forma descendente (createdAt DESC)', () => {
    const secondPayload = {
      title: 'Guía de Taller 2 - Teorema de Stokes',
      content: 'Repasar integración de superficies orientables y frontera suave a trozos.',
      linkUrl: 'https://drive.google.com/file/d/stokes-guide',
    };

    // Crear un segundo apunte
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: secondPayload,
    }).then((createRes) => {
      expect(createRes.status).to.be.oneOf([200, 201]);

      // Consultar la bitácora completa de la asignatura
      cy.request({
        method: 'GET',
        url: `/subjects/${subjectId}/notes`,
        headers: { Authorization: `Bearer ${userTokenA}` },
      }).then((listRes) => {
        expect(listRes.status).to.eq(200);
        expect(listRes.body.data).to.be.an('array');
        expect(listRes.body.data.length).to.be.at.least(2);

        // Invariante de regresión: El apunte más reciente debe aparecer en la primera posición
        const notes = listRes.body.data;
        expect(notes[0].title).to.eq(secondPayload.title);

        const dateFirst = new Date(notes[0].createdAt).getTime();
        const dateSecond = new Date(notes[1].createdAt).getTime();
        expect(dateFirst).to.be.at.least(dateSecond);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO DE SEGURIDAD: Rechazo de Protocolos Inseguros o Maliciosos (XSS)
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería rechazar URLs con protocolos peligrosos (javascript:, ftp:) o formato inválido', () => {
    // Intento de inyección XSS con javascript:
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        title: 'Ataque de Scripting en URL',
        content: 'Prueba de validación estricta de protocolos',
        linkUrl: 'javascript:alert(document.cookie)',
      },
      failOnStatusCode: false,
    }).then((xssRes) => {
      expect(xssRes.status).to.eq(400);
    });

    // Intento con protocolo no web (ftp:)
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        title: 'Enlace FTP no permitido',
        content: 'Prueba de restricción a HTTP/HTTPS',
        linkUrl: 'ftp://ftp.repositorio.edu/archivo.pdf',
      },
      failOnStatusCode: false,
    }).then((ftpRes) => {
      expect(ftpRes.status).to.eq(400);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE SEGURIDAD: Aislamiento Multiusuario y Control de Acceso (Anti-IDOR)
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería denegar acceso (403/404) a un usuario que intenta leer o alterar notas de otro', () => {
    // Usuario B (Atacante) intenta leer los apuntes de la materia del Usuario A
    cy.request({
      method: 'GET',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      failOnStatusCode: false,
    }).then((getRes) => {
      expect(getRes.status).to.be.oneOf([403, 404]);
    });

    // Usuario B intenta inyectar un apunte ilegítimo en la materia del Usuario A
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      body: {
        title: 'Apunte Foráneo Ilegítimo',
        content: 'Violación de propiedad de materia',
      },
      failOnStatusCode: false,
    }).then((postRes) => {
      expect(postRes.status).to.be.oneOf([403, 404]);
    });

    // Usuario B intenta modificar el apunte creado por Usuario A
    if (createdNoteId) {
      cy.request({
        method: 'PATCH',
        url: `/subjects/${subjectId}/notes/${createdNoteId}`,
        headers: { Authorization: `Bearer ${userTokenB}` },
        body: {
          title: 'Título manipulado por atacante',
        },
        failOnStatusCode: false,
      }).then((patchRes) => {
        expect(patchRes.status).to.be.oneOf([403, 404]);
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE ERROR: Validación de Dominio (Campos Vacíos y Materia Inexistente)
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería retornar 400 ante campos vacíos y 404 ante materia inexistente', () => {
    // Intento de creación con título vacío o sólo espacios
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        title: '   ',
        content: 'Contenido presente pero título inválido',
      },
      failOnStatusCode: false,
    }).then((emptyTitleRes) => {
      expect(emptyTitleRes.status).to.eq(400);
    });

    // Intento de creación con contenido vacío
    cy.request({
      method: 'POST',
      url: `/subjects/${subjectId}/notes`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: {
        title: 'Título Válido',
        content: '',
      },
      failOnStatusCode: false,
    }).then((emptyContentRes) => {
      expect(emptyContentRes.status).to.eq(400);
    });

    // Consulta de notas sobre materia inexistente
    cy.request({
      method: 'GET',
      url: '/subjects/999999/notes',
      headers: { Authorization: `Bearer ${userTokenA}` },
      failOnStatusCode: false,
    }).then((notFoundRes) => {
      expect(notFoundRes.status).to.be.oneOf([403, 404]);
    });
  });
});
