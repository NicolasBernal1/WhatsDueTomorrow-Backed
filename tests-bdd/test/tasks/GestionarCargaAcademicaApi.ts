import { Task } from '@serenity-js/core';
import { GetRequest, PostRequest, Send } from '@serenity-js/rest';

export class GestionarCargaAcademicaApi {
  static consultarCarga(token: string): Task {
    return Task.where(
      `#actor consulta la carga académica con token JWT vía API`,
      Send.a(
        GetRequest.to('/subjects/academic-load').using({
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      )
    );
  }

  static consultarCargaSinToken(): Task {
    return Task.where(
      `#actor consulta la carga académica sin token de autorización vía API`,
      Send.a(
        GetRequest.to('/subjects/academic-load').using({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    );
  }

  static intentarCrearAsignaturaConCreditosInvalidos(
    creditos: number,
    token: string
  ): Task {
    return Task.where(
      `#actor intenta registrar una asignatura con ${creditos} créditos vía API`,
      Send.a(
        PostRequest.to('/subjects')
          .with({
            name: 'Asignatura Limite Invalido',
            professor: 'Profesor Limite',
            credits: creditos,
          })
          .using({
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
      )
    );
  }
}
