describe('F22: Desglosar Tareas en Subtareas con Avance Porcentual (Backend API & Seguridad)', () => {
  let userTokenA;
  let userTokenB;
  let subjectId;
  let assignmentId;
  let subtaskIds = [];

  before(() => {
    // 1. Registrar y autenticar Usuario A
    cy.registerAndLogin({ name: 'Usuario Primario' }).then(({ token }) => {
      userTokenA = token;

      // Crear asignatura para Usuario A
      cy.request({
        method: 'POST',
        url: '/subjects',
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: {
          name: 'Sistemas Distribuidos',
          professor: 'Profesor Cypress',
        },
      }).then((subRes) => {
        expect(subRes.status).to.be.oneOf([200, 201]);

        cy.request({
          method: 'GET',
          url: '/subjects',
          headers: { Authorization: `Bearer ${userTokenA}` },
        }).then((listRes) => {
          subjectId = listRes.body.data[0].id;

          // Crear entrega para Usuario A
          cy.request({
            method: 'POST',
            url: `/assignments/subject/${subjectId}`,
            headers: { Authorization: `Bearer ${userTokenA}` },
            body: {
              title: 'Proyecto Microservicios',
              description: 'Implementación modular con subtareas',
              dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
            },
          }).then((assignRes) => {
            expect(assignRes.status).to.be.oneOf([200, 201]);

            // Obtener el ID de la entrega creada
            cy.request({
              method: 'GET',
              url: `/assignments/subject/${subjectId}`,
              headers: { Authorization: `Bearer ${userTokenA}` },
            }).then((assignList) => {
              assignmentId = assignList.body.data[0].id;
            });
          });
        });
      });
    });

    // 2. Registrar Usuario B (para pruebas de seguridad Anti-IDOR)
    cy.registerAndLogin({ name: 'Usuario Secundario' }).then(({ token }) => {
      userTokenB = token;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ESCENARIO EXITOSO: Creación y Listado de Subtareas (API)
  // ──────────────────────────────────────────────────────────────────────────
  it('E1: Debería crear subtareas con posición consecutiva y progreso inicial 0%', () => {
    cy.request({
      method: 'POST',
      url: `/assignments/${assignmentId}/subtasks`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: { title: 'Diseñar arquitectura de base de datos' },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body.data).to.have.property('subtasks');
      expect(response.body.data.progress).to.eq(0);

      const created = response.body.data.subtasks[0];
      expect(created.title).to.eq('Diseñar arquitectura de base de datos');
      expect(created.completed).to.be.false;
      expect(created.position).to.eq(0);
      subtaskIds.push(created.id);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ESCENARIO ALTERNATIVO / REGRESIÓN: Cálculo Matemático de Avance (33%, 67%, 100%)
  // ──────────────────────────────────────────────────────────────────────────
  it('E2: Debería recalcular el progreso con precisión matemática y permitir reordenamiento', () => {
    // Agregar segunda y tercera subtarea
    cy.request({
      method: 'POST',
      url: `/assignments/${assignmentId}/subtasks`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: { title: 'Implementar endpoints REST' },
    }).then((res2) => {
      subtaskIds.push(res2.body.data.subtasks[1].id);

      cy.request({
        method: 'POST',
        url: `/assignments/${assignmentId}/subtasks`,
        headers: { Authorization: `Bearer ${userTokenA}` },
        body: { title: 'Escribir pruebas automatizadas' },
      }).then((res3) => {
        subtaskIds.push(res3.body.data.subtasks[2].id);
        expect(res3.body.data.subtasks).to.have.length(3);
        expect(res3.body.data.progress).to.eq(0);

        // 1 de 3 completadas -> 33%
        cy.request({
          method: 'PATCH',
          url: `/assignments/${assignmentId}/subtasks/${subtaskIds[0]}`,
          headers: { Authorization: `Bearer ${userTokenA}` },
          body: { completed: true },
        }).then((patchRes1) => {
          expect(patchRes1.status).to.eq(200);
          expect(patchRes1.body.data.progress).to.eq(33);

          // 2 de 3 completadas -> 67%
          cy.request({
            method: 'PATCH',
            url: `/assignments/${assignmentId}/subtasks/${subtaskIds[1]}`,
            headers: { Authorization: `Bearer ${userTokenA}` },
            body: { completed: true },
          }).then((patchRes2) => {
            expect(patchRes2.status).to.eq(200);
            expect(patchRes2.body.data.progress).to.eq(67);

            // Reordenar subtareas (invertir orden)
            const reversedOrder = [subtaskIds[2], subtaskIds[1], subtaskIds[0]];
            cy.request({
              method: 'PATCH',
              url: `/assignments/${assignmentId}/subtasks/order`,
              headers: { Authorization: `Bearer ${userTokenA}` },
              body: { orderedIds: reversedOrder },
            }).then((orderRes) => {
              expect(orderRes.status).to.eq(200);
              expect(orderRes.body.data.subtasks[0].id).to.eq(subtaskIds[2]);
              expect(orderRes.body.data.subtasks[0].position).to.eq(0);
            });
          });
        });
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ESCENARIO DE SEGURIDAD: Aislamiento Multiusuario y Anti-IDOR
  // ──────────────────────────────────────────────────────────────────────────
  it('E3: Debería prohibir (403 Forbidden) que Usuario B altere subtareas de Usuario A', () => {
    // Usuario B intenta actualizar subtarea de Usuario A
    cy.request({
      method: 'PATCH',
      url: `/assignments/${assignmentId}/subtasks/${subtaskIds[0]}`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      body: { completed: false },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });

    // Usuario B intenta eliminar subtarea de Usuario A
    cy.request({
      method: 'DELETE',
      url: `/assignments/${assignmentId}/subtasks/${subtaskIds[0]}`,
      headers: { Authorization: `Bearer ${userTokenB}` },
      failOnStatusCode: false,
    }).then((delRes) => {
      expect(delRes.status).to.eq(403);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ESCENARIO DE ERROR: Validación de Dominio (Título Vacío / Espacios)
  // ──────────────────────────────────────────────────────────────────────────
  it('E4: Debería rechazar con 400 Bad Request subtareas con títulos vacíos o solo espacios', () => {
    cy.request({
      method: 'POST',
      url: `/assignments/${assignmentId}/subtasks`,
      headers: { Authorization: `Bearer ${userTokenA}` },
      body: { title: '    ' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ESCENARIO DE REGRESIÓN: Compactación Posicional al Eliminar
  // ──────────────────────────────────────────────────────────────────────────
  it('E5: Debería compactar índices de posición al eliminar una subtarea', () => {
    // Eliminar una de las subtareas
    cy.request({
      method: 'DELETE',
      url: `/assignments/${assignmentId}/subtasks/${subtaskIds[2]}`,
      headers: { Authorization: `Bearer ${userTokenA}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.subtasks).to.have.length(2);
      // Validar que las posiciones remanentes sean 0 y 1 consecutivas
      expect(res.body.data.subtasks[0].position).to.eq(0);
      expect(res.body.data.subtasks[1].position).to.eq(1);
    });
  });
});
