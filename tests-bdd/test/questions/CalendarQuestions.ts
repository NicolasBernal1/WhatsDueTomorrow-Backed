import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';
import { Text, Value } from '@serenity-js/web';

import { CalendarUI } from '../ui/CalendarUI';

export const CalendarQuestions = {
  tituloSincronizacion: (): Question<Promise<string>> =>
    Text.of(CalendarUI.tituloSincronizacion()).describedAs('título de la sección de sincronización'),

  enlaceSuscripcion: (): Question<Promise<string>> =>
    Value.of(CalendarUI.enlaceSuscripcion()).describedAs('valor del enlace de suscripción webcal'),

  mensajeCalendario: (): Question<Promise<string>> =>
    Text.of(CalendarUI.mensajeCalendario()).describedAs('mensaje informativo de estado de calendario'),

  cuerpoRespuestaIcs: (): Question<Promise<string>> =>
    LastResponse.body<string>().describedAs('cuerpo del archivo de calendario iCalendar .ics'),
};
