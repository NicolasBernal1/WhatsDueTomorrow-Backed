import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes, isGreaterThan, not, or } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';
import { isEnabled } from '@serenity-js/web';

import { EvaluationQuestions } from '../../test/questions/EvaluationQuestions';
import {
  ensureInitialEvaluation,
  EvaluationsAttackerContext,
  EvaluationsTestContext,
  getOrCreateEvaluationsAttacker,
  getOrCreateEvaluationsContext,
} from '../../test/support/evaluationsHelper';
import { GestionarEvaluacionesApi } from '../../test/tasks/GestionarEvaluacionesApi';
import { IngresarDatosEvaluacion } from '../../test/tasks/IngresarDatosEvaluacion';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { NavegarAAsignatura } from '../../test/tasks/NavegarAAsignatura';
import { RegistrarEvaluacion } from '../../test/tasks/RegistrarEvaluacion';
import { SimularEscenarioHipotetico } from '../../test/tasks/SimularEscenarioHipotetico';
import { EvaluationsUI } from '../../test/ui/EvaluationsUI';

let evaluationsContext: EvaluationsTestContext;
let attackerContext: EvaluationsAttackerContext;

Given(
  'que {actor} abre la aplicación e inicia sesión con su cuenta de calificaciones',
  async (actor: Actor) => {
    evaluationsContext = await getOrCreateEvaluationsContext();
    await actor.attemptsTo(
      IniciarSesion.conCredenciales(evaluationsContext.email, evaluationsContext.password)
    );
  }
);

Given(
  '{pronoun} dispone de una evaluación inicial registrada en su asignatura',
  async (actor: Actor) => {
    if (!evaluationsContext) {
      evaluationsContext = await getOrCreateEvaluationsContext();
    }
    await ensureInitialEvaluation(evaluationsContext);
  }
);

Given('Alicia dispone de una evaluación inicial registrada en su asignatura', async () => {
  if (!evaluationsContext) {
    evaluationsContext = await getOrCreateEvaluationsContext();
  }
  await ensureInitialEvaluation(evaluationsContext);
});

When('{pronoun} ingresa a la vista de su asignatura', async (actor: Actor) => {
  if (!evaluationsContext) {
    evaluationsContext = await getOrCreateEvaluationsContext();
  }
  await actor.attemptsTo(NavegarAAsignatura.conId(evaluationsContext.subjectId));
});

When(
  /^ella registra la evaluación "([^"]+)" con peso (\d+)% y calificación ([\d\.]+)$/,
  async (nombre: string, peso: string, nota: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(RegistrarEvaluacion.conDatos(nombre, peso, nota));
  }
);

Then('el promedio ponderado se actualiza a {string}', async (promedioEsperado: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Wait.upTo(Duration.ofSeconds(10)).until(
      EvaluationQuestions.promedioPonderado(),
      equals(promedioEsperado)
    ),
    Ensure.that(EvaluationQuestions.promedioPonderado(), equals(promedioEsperado))
  );
});

Then('los puntos acumulados reflejan {string}', async (puntosEsperados: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(EvaluationQuestions.puntosAcumulados(), includes(puntosEsperados))
  );
});

Then('el peso evaluado refleja {string}', async (pesoEsperado: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(EvaluationQuestions.pesoEvaluado(), includes(pesoEsperado))
  );
});

Then('el estado académico indica {string}', async (estadoEsperado: string) => {
  const actor = actorInTheSpotlight();
  const labelMap: Record<string, string> = {
    'Aprobado': 'Passed',
    'Aprobando': 'Passing',
    'En riesgo': 'At risk',
    'Sin calificaciones': 'No grades',
  };
  const expectedUiLabel = labelMap[estadoEsperado] || estadoEsperado;
  await actor.attemptsTo(
    Ensure.that(
      EvaluationQuestions.estadoAcademico(),
      or(includes(estadoEsperado), includes(expectedUiLabel))
    )
  );
});

When(
  'ella ingresa una calificación hipotética de {string} en el simulador de escenarios',
  async (notaHipotetica: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(SimularEscenarioHipotetico.conNota(notaHipotetica));
  }
);

Then(
  'el simulador proyecta una nota final estimada de {string}',
  async (notaProyectada: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(10)).until(
        EvaluationQuestions.notaFinalEstimada(),
        equals(notaProyectada)
      ),
      Ensure.that(EvaluationQuestions.notaFinalEstimada(), equals(notaProyectada))
    );
  }
);

When(
  /^ella intenta registrar una evaluación con nombre "([^"]+)", peso (\d+)% y calificación ([\d\.]+)$/,
  async (nombre: string, peso: string, nota: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(IngresarDatosEvaluacion.conValores(nombre, peso, nota));
  }
);

Then('el formulario bloquea el registro con mensajes de validación', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(EvaluationQuestions.cantidadErroresValidacion(), isGreaterThan(0))
  );
});

Then('el botón de guardar se encuentra deshabilitado', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(EvaluationsUI.botonGuardarModal(), not(isEnabled()))
  );
});

// API / Anti-IDOR steps
Given(
  'que el usuario Api dispone de una asignatura configurada con calificaciones',
  async () => {
    actorCalled('Api');
    evaluationsContext = await getOrCreateEvaluationsContext();
    attackerContext = await getOrCreateEvaluationsAttacker();
    await ensureInitialEvaluation(evaluationsContext);
  }
);

When('un usuario atacante intenta consultar las evaluaciones de dicha asignatura', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    GestionarEvaluacionesApi.intentarConsultaAjena(
      evaluationsContext.subjectId,
      attackerContext.token
    )
  );
});

Then(
  'la respuesta HTTP del servidor deniega el acceso a notas con código 403 o 404',
  async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Ensure.that(LastResponse.status(), or(equals(403), equals(404)))
    );
  }
);

When(
  'cuando el usuario atacante intenta registrar una evaluación en dicha asignatura',
  async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      GestionarEvaluacionesApi.intentarRegistroAjeno(
        evaluationsContext.subjectId,
        attackerContext.token,
        {
          name: 'Calificación Maliciosa',
          weight: 20,
          score: 5.0,
        }
      )
    );
  }
);

Then(
  'la respuesta HTTP del servidor deniega el registro de notas con código 403 o 404',
  async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Ensure.that(LastResponse.status(), or(equals(403), equals(404)))
    );
  }
);
