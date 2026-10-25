import { Task } from '@serenity-js/core';
import { GetRequest, Send } from '@serenity-js/rest';

export const ConsultarEntregasUrgentesApi = {
  sinAutenticacion: () => Task.where(
    '#actor consulta las entregas urgentes sin token de autorización',
    Send.a(GetRequest.to('/assignments/upcoming')),
  ),
  conToken: (token: string) => Task.where(
    '#actor consulta las entregas urgentes con token de autorización',
    Send.a(
      GetRequest.to('/assignments/upcoming').using({
        headers: {
          Authorization: `Bearer ${ token }`,
        },
      })
    ),
  ),
};
