import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes, or } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

import { NoteQuestions } from '../../test/questions/NoteQuestions';
import {
  NotesAttackerContext,
  NotesTestContext,
  createNoteDirectly,
  getOrCreateNotesAttacker,
  getOrCreateNotesContext,
} from '../../test/support/notesHelper';
import { EditarApunte } from '../../test/tasks/EditarApunte';
import { GestionarApuntesApi } from '../../test/tasks/GestionarApuntesApi';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { NavegarAAsignatura } from '../../test/tasks/NavegarAAsignatura';
import { RegistrarApunte } from '../../test/tasks/RegistrarApunte';

let notesContext: NotesTestContext;
let attackerContext: NotesAttackerContext;

Given('que {actor} abre la aplicación e inicia sesión con su cuenta de bitácora', async (actor: Actor) => {
  notesContext = await getOrCreateNotesContext();
  await actor.attemptsTo(
    IniciarSesion.conCredenciales(notesContext.email, notesContext.password)
  );
});

Given('Alicia tiene un apunte registrado previamente en la asignatura', async () => {
  if (!notesContext) {
    notesContext = await getOrCreateNotesContext();
  }
  await createNoteDirectly(
    'Fórmulas de Gradiente y Rotacional',
    'Contenido inicial pendiente de actualización.',
    'https://ocw.mit.edu/courses/mathematics/gradient-notes'
  );
});

When('{pronoun} navega al detalle de su asignatura', async (actor: Actor) => {
  if (!notesContext) {
    notesContext = await getOrCreateNotesContext();
  }
  await actor.attemptsTo(
    NavegarAAsignatura.conId(notesContext.subjectId)
  );
});

When('{pronoun} registra un apunte con título {string}, contenido {string} y enlace {string}', async (
  actor: Actor,
  titulo: string,
  contenido: string,
  enlace: string
) => {
  await actor.attemptsTo(
    RegistrarApunte.conDatos(titulo, contenido, enlace)
  );
});

Then('el apunte aparece visible en la bitácora con el título {string}', async (tituloEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.tituloPrimerApunte(), equals(tituloEsperado))
  );
});

Then('el contenido del apunte contiene {string}', async (fragmentoEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.contenidoPrimerApunte(), includes(fragmentoEsperado))
  );
});

Then('el enlace externo apunta a {string}', async (enlaceEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.enlacePrimerApunte(), equals(enlaceEsperado))
  );
});

Then('el enlace externo tiene los atributos de seguridad para abrir en nueva pestaña', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.targetPrimerApunte(), equals('_blank')),
    Ensure.that(NoteQuestions.relPrimerApunte(), includes('noopener'))
  );
});

When('{pronoun} actualiza el contenido del apunte a {string}', async (actor: Actor, nuevoContenido: string) => {
  await actor.attemptsTo(
    EditarApunte.conNuevoContenido(nuevoContenido)
  );
});

Given('que el usuario {actor} cuenta con una asignatura registrada para la bitácora', async (actor: Actor) => {
  notesContext = await getOrCreateNotesContext();
});

When('el usuario {actor} registra un primer apunte titulado {string}', async (actor: Actor, titulo: string) => {
  await actor.attemptsTo(
    GestionarApuntesApi.crearApunte(
      notesContext.subjectId,
      titulo,
      'Contenido del primer apunte cronológico',
      undefined,
      notesContext.token
    )
  );
});

When('el usuario {actor} registra un segundo apunte titulado {string}', async (actor: Actor, titulo: string) => {
  await actor.attemptsTo(
    GestionarApuntesApi.crearApunte(
      notesContext.subjectId,
      titulo,
      'Contenido del segundo apunte cronológico reciente',
      'https://drive.google.com/file/d/stokes-guide',
      notesContext.token
    )
  );
});

When('el usuario {actor} consulta los apuntes de la asignatura', async (actor: Actor) => {
  await actor.attemptsTo(
    GestionarApuntesApi.consultarBitacora(notesContext.subjectId, notesContext.token)
  );
});

Then('el primer apunte en la lista es {string}', async (tituloEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.primerTituloDeRespuestaApi(), equals(tituloEsperado))
  );
});

Then('los apuntes mantienen orden cronológico descendente por fecha de creación', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(NoteQuestions.ordenCronologicoDescendente(), equals(true))
  );
});

When('el usuario {actor} intenta registrar un apunte con protocolo peligroso {string}', async (
  actor: Actor,
  urlPeligrosa: string
) => {
  await actor.attemptsTo(
    GestionarApuntesApi.intentarUrlInsegura(
      notesContext.subjectId,
      'Ataque Scripting URL',
      'Prueba de validación estricta de protocolos',
      urlPeligrosa,
      notesContext.token
    )
  );
});

When('el usuario {actor} intenta consultar la bitácora de la asignatura ajena', async (actor: Actor) => {
  attackerContext = await getOrCreateNotesAttacker();
  await actor.attemptsTo(
    GestionarApuntesApi.intentarAccesoAjeno(notesContext.subjectId, attackerContext.token)
  );
});

Then('el servidor rechaza el acceso ajeno con código 403 o 404', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(LastResponse.status(), or(equals(403), equals(404)))
  );
});
