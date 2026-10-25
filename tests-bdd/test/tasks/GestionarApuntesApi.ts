import { Task } from '@serenity-js/core';
import { GetRequest, PostRequest, Send } from '@serenity-js/rest';

export const GestionarApuntesApi = {
  crearApunte: (subjectId: number, title: string, content: string, linkUrl: string | undefined, token: string) => Task.where(
    `#actor crea un apunte vía API titulado "${ title }"`,
    Send.a(
      PostRequest.to(`/subjects/${ subjectId }/notes`)
        .with(linkUrl ? { title, content, linkUrl } : { title, content })
        .using({
          headers: {
            Authorization: `Bearer ${ token }`,
            'Content-Type': 'application/json',
          },
        })
    ),
  ),

  consultarBitacora: (subjectId: number, token: string) => Task.where(
    `#actor consulta la bitácora de la asignatura #${ subjectId } vía API`,
    Send.a(
      GetRequest.to(`/subjects/${ subjectId }/notes`)
        .using({
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        })
    ),
  ),

  intentarUrlInsegura: (subjectId: number, title: string, content: string, linkUrl: string, token: string) => Task.where(
    `#actor intenta registrar un apunte con protocolo inseguro "${ linkUrl }"`,
    Send.a(
      PostRequest.to(`/subjects/${ subjectId }/notes`)
        .with({ title, content, linkUrl })
        .using({
          headers: {
            Authorization: `Bearer ${ token }`,
            'Content-Type': 'application/json',
          },
        })
    ),
  ),

  intentarAccesoAjeno: (subjectId: number, attackerToken: string) => Task.where(
    `#actor intenta acceder a la bitácora ajena de la asignatura #${ subjectId }`,
    Send.a(
      GetRequest.to(`/subjects/${ subjectId }/notes`)
        .using({
          headers: {
            Authorization: `Bearer ${ attackerToken }`,
          },
        })
    ),
  ),
};
