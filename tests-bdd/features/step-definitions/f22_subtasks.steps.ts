import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';
import { Enter } from '@serenity-js/web';

import { SubtaskQuestions } from '../../test/questions/SubtaskQuestions';
import {
  AssignmentTestContext,
  createSubtaskForAntiIdor,
  getOrCreateAssignmentContext,
  getOrCreateAttacker,
} from '../../test/support/subtaskHelper';
import { AgregarSubtarea } from '../../test/tasks/AgregarSubtarea';
import { AlterarSubtareaAjenaApi } from '../../test/tasks/AlterarSubtareaAjenaApi';
import { CompletarSubtarea } from '../../test/tasks/CompletarSubtarea';
import { EliminarUltimaSubtarea } from '../../test/tasks/EliminarUltimaSubtarea';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { NavegarADetalleEntrega } from '../../test/tasks/NavegarADetalleEntrega';
import { SubtasksUI } from '../../test/ui/SubtasksUI';

let assignmentContext: AssignmentTestContext;

Given('que {actor} abre la aplicación e inicia sesión con su cuenta de entregas', async (actor: Actor) => {
  assignmentContext = await getOrCreateAssignmentContext();
  await actor.attemptsTo(
    IniciarSesion.conCredenciales(assignmentContext.email, assignmentContext.password)
  );
});

Given('Alicia tiene una entrega registrada para gestionar subtareas', async () => {
  assignmentContext = await getOrCreateAssignmentContext();
});

When('{pronoun} navega al detalle de su entrega', async (actor: Actor) => {
  if (!assignmentContext) {
    assignmentContext = await getOrCreateAssignmentContext();
  }
  await actor.attemptsTo(
    NavegarADetalleEntrega.conId(assignmentContext.assignmentId)
  );
});

When('{pronoun} agrega las siguientes subtareas:', async (actor: Actor, table: DataTable) => {
  const titles = table.raw().flat();
  for (const title of titles) {
    await actor.attemptsTo(
      AgregarSubtarea.conTitulo(title)
    );
  }
});

Then('el progreso de la entrega indica {string}', async (progresoEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Wait.upTo(Duration.ofSeconds(10)).until(SubtaskQuestions.progreso(), equals(progresoEsperado)),
    Ensure.that(SubtaskQuestions.progreso(), equals(progresoEsperado))
  );
});

When('{pronoun} marca como completada la subtarea {string}', async (actor: Actor, titulo: string) => {
  await actor.attemptsTo(
    CompletarSubtarea.llamada(titulo)
  );
});

Then('el sistema despliega el mensaje de completitud {string}', async (mensajeEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(SubtaskQuestions.mensajeCompletitud(), equals(mensajeEsperado))
  );
});

When('{pronoun} elimina la última subtarea de la lista', async (actor: Actor) => {
  await actor.attemptsTo(
    EliminarUltimaSubtarea.deLaLista()
  );
});

Then('el sistema actualiza la lista de subtareas', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(SubtasksUI.contenedorPrincipal().isPresent(), equals(true))
  );
});

When('{pronoun} escribe solo espacios en el campo de nueva subtarea', async (actor: Actor) => {
  await actor.attemptsTo(
    Enter.theValue('     ').into(SubtasksUI.campoNuevaSubtarea())
  );
});

Then('el botón de agregar subtarea permanece deshabilitado', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(SubtaskQuestions.botonAgregarHabilitado(), equals(false))
  );
});

let antiIdorSubtaskId: number;

Given('que Alicia tiene una subtarea creada en la plataforma', async () => {
  assignmentContext = await getOrCreateAssignmentContext();
  antiIdorSubtaskId = await createSubtaskForAntiIdor(assignmentContext.assignmentId, assignmentContext.token);
});

When('el usuario {actor} intenta modificar la subtarea ajena', async (actor: Actor) => {
  if (!assignmentContext) {
    assignmentContext = await getOrCreateAssignmentContext();
  }
  const attacker = await getOrCreateAttacker();
  await actor.attemptsTo(
    AlterarSubtareaAjenaApi.marcarCompletada(
      assignmentContext.assignmentId,
      antiIdorSubtaskId,
      attacker.token
    )
  );
});

Then('el servidor rechaza la modificación con código {int}', async (codigoEsperado: number) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(LastResponse.status(), equals(codigoEsperado))
  );
});
