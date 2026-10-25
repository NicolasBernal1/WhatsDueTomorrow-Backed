import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, not } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';
import { isVisible } from '@serenity-js/web';

import { RadarQuestions } from '../../test/questions/RadarQuestions';
import { getOrCreateTestUser } from '../../test/support/authHelper';
import { ActivarAlertasWeb } from '../../test/tasks/ActivarAlertasWeb';
import { ConsultarEntregasUrgentesApi } from '../../test/tasks/ConsultarEntregasUrgentesApi';
import { ConsultarRadar } from '../../test/tasks/ConsultarRadar';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { RadarUI } from '../../test/ui/RadarUI';

Given('que {actor} abre la aplicación e inicia sesión en la plataforma', async (actor: Actor) => {
  const credentials = await getOrCreateTestUser();
  await actor.attemptsTo(
    IniciarSesion.conCredenciales(credentials.email, credentials.password)
  );
});

When('{pronoun} consulta el radar de entregas urgentes', async (actor: Actor) => {
  await actor.attemptsTo(
    ConsultarRadar.deEntregasUrgentes()
  );
});

Then('{pronoun} observa el título {string}', async (actor: Actor, tituloEsperado: string) => {
  await actor.attemptsTo(
    Ensure.that(RadarQuestions.titulo(), equals(tituloEsperado))
  );
});

Then('el radar de entregas urgentes está visible en pantalla', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(RadarUI.titulo(), isVisible())
  );
});

Then('el radar muestra el mensaje {string}', async (mensajeEsperado: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(RadarQuestions.tituloVacio(), equals(mensajeEsperado))
  );
});

Then('la descripción indica {string}', async (descripcionEsperada: string) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(RadarQuestions.descripcionVacio(), equals(descripcionEsperada))
  );
});

When('{pronoun} activa las alertas web en el radar', async (actor: Actor) => {
  await actor.attemptsTo(
    ActivarAlertasWeb.enElRadar()
  );
});

Then('el sistema despliega una notificación sobre las alertas web', async () => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(RadarQuestions.mensajeNotificacion(), not(equals('')))
  );
});

When('el actor {actor} solicita las entregas urgentes sin token de autorización', async (actor: Actor) => {
  await actor.attemptsTo(
    ConsultarEntregasUrgentesApi.sinAutenticacion()
  );
});

Then('la respuesta HTTP del servidor tiene código {int}', async (codigoEsperado: number) => {
  await actorInTheSpotlight().attemptsTo(
    Ensure.that(LastResponse.status(), equals(codigoEsperado))
  );
});
