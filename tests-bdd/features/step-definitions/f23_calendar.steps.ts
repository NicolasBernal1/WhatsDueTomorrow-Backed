import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, includes, startsWith } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight } from '@serenity-js/core';

import { CalendarQuestions } from '../../test/questions/CalendarQuestions';
import {
  CalendarTestContext,
  getOrCreateCalendarContext,
} from '../../test/support/calendarHelper';
import { CopiarEnlaceCalendario } from '../../test/tasks/CopiarEnlaceCalendario';
import { GestionarCalendarioApi } from '../../test/tasks/GestionarCalendarioApi';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { NavegarAHorario } from '../../test/tasks/NavegarAHorario';
import { SincronizarCalendario } from '../../test/tasks/SincronizarCalendario';

let calendarContext: CalendarTestContext;

Given('que {actor} abre la aplicación e inicia sesión con su cuenta de calendario', async (actor: Actor) => {
  calendarContext = await getOrCreateCalendarContext();
  await actor.attemptsTo(
    IniciarSesion.conCredenciales(calendarContext.email, calendarContext.password)
  );
});

When('{pronoun} navega al módulo de horario y sincronización', async (actor: Actor) => {
  await actor.attemptsTo(
    NavegarAHorario.enLaPlataforma()
  );
});

When('{pronoun} genera el enlace de sincronización de calendario', async (actor: Actor) => {
  await actor.attemptsTo(
    SincronizarCalendario.generarEnlace()
  );
});

Then('el enlace de suscripción comienza con {string}', async (prefijoEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(CalendarQuestions.enlaceSuscripcion(), startsWith(prefijoEsperado))
  );
});

Then('el sistema muestra el mensaje informativo {string}', async (mensajeEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(CalendarQuestions.mensajeCalendario(), includes(mensajeEsperado))
  );
});

When('{pronoun} copia el enlace al portapapeles', async (actor: Actor) => {
  await actor.attemptsTo(
    CopiarEnlaceCalendario.alPortapapeles()
  );
});

Given('que el usuario {actor} cuenta con un token de autenticación válido', async (actor: Actor) => {
  calendarContext = await getOrCreateCalendarContext();
});

When('el usuario {actor} solicita la descarga del archivo .ics', async (actor: Actor) => {
  if (!calendarContext) {
    calendarContext = await getOrCreateCalendarContext();
  }
  await actor.attemptsTo(
    GestionarCalendarioApi.descargarIcsConToken(calendarContext.token)
  );
});

Then('el archivo contiene el bloque canónico {string}', async (bloqueEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(CalendarQuestions.cuerpoRespuestaIcs(), includes(bloqueEsperado))
  );
});

Then('el archivo contiene la especificación de versión {string}', async (versionEsperada: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(CalendarQuestions.cuerpoRespuestaIcs(), includes(versionEsperada))
  );
});

Then('el archivo finaliza con el bloque canónico {string}', async (bloqueFinal: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(CalendarQuestions.cuerpoRespuestaIcs(), includes(bloqueFinal))
  );
});

When('el usuario {actor} solicita la descarga del archivo .ics sin token de autorización', async (actor: Actor) => {
  await actor.attemptsTo(
    GestionarCalendarioApi.descargarIcsSinToken()
  );
});

When('el usuario {actor} consulta un feed de calendario con token inexistente {string}', async (actor: Actor, tokenInvalido: string) => {
  await actor.attemptsTo(
    GestionarCalendarioApi.consultarFeedConTokenInvalido(tokenInvalido)
  );
});
