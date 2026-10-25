import { Task } from '@serenity-js/core';
import { GetRequest, PostRequest, Send } from '@serenity-js/rest';

export class GestionarEvaluacionesApi {
  static consultarEvaluaciones(subjectId: number, token: string): Task {
    return Task.where(
      `#actor consulta las evaluaciones de la asignatura ${subjectId} vía API`,
      Send.a(
        GetRequest.to(`/subjects/${subjectId}/evaluations`).using({
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      )
    );
  }

  static registrarEvaluacion(
    subjectId: number,
    token: string,
    evaluacion: { name: string; weight: number; score: number }
  ): Task {
    return Task.where(
      `#actor registra una evaluación en la asignatura ${subjectId} vía API`,
      Send.a(
        PostRequest.to(`/subjects/${subjectId}/evaluations`)
          .with(evaluacion)
          .using({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
      )
    );
  }

  static intentarConsultaAjena(subjectId: number, attackerToken: string): Task {
    return Task.where(
      `#actor atacante intenta consultar evaluaciones de la asignatura ajena ${subjectId}`,
      Send.a(
        GetRequest.to(`/subjects/${subjectId}/evaluations`).using({
          headers: {
            Authorization: `Bearer ${attackerToken}`,
            'Content-Type': 'application/json',
          },
        })
      )
    );
  }

  static intentarRegistroAjeno(
    subjectId: number,
    attackerToken: string,
    evaluacion: { name: string; weight: number; score: number }
  ): Task {
    return Task.where(
      `#actor atacante intenta registrar evaluación en la asignatura ajena ${subjectId}`,
      Send.a(
        PostRequest.to(`/subjects/${subjectId}/evaluations`)
          .with(evaluacion)
          .using({
            headers: {
              Authorization: `Bearer ${attackerToken}`,
              'Content-Type': 'application/json',
            },
          })
      )
    );
  }
}
