import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export const GestionarCalendarioApi = {
  descargarIcsConToken: (token: string) => Task.where(
    '#actor solicita la descarga del archivo .ics con token de autorización',
    Send.a(
      GetRequest.to('/calendar/download').using({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    ),
  ),

  descargarIcsSinToken: () => Task.where(
    '#actor solicita la descarga del archivo .ics sin token de autorización',
    Send.a(GetRequest.to('/calendar/download')),
  ),

  consultarFeedConTokenInvalido: (tokenInvalido: string) => Task.where(
    `#actor solicita el feed público de calendario con token inválido "${tokenInvalido}"`,
    Send.a(GetRequest.to(`/calendar/feed/${tokenInvalido}.ics`)),
  ),
};
