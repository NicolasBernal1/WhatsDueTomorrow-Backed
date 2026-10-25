import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes, isGreaterThan, not } from '@serenity-js/assertions';
import { Actor, actorCalled, actorInTheSpotlight, Duration, Wait } from '@serenity-js/core';
import { isEnabled } from '@serenity-js/web';

import { AcademicLoadQuestions } from '../../test/questions/AcademicLoadQuestions';
import {
  AcademicLoadTestContext,
  getOrCreateAcademicLoadContext,
} from '../../test/support/academicLoadHelper';
import { GestionarCargaAcademicaApi } from '../../test/tasks/GestionarCargaAcademicaApi';
import { IngresarDatosAsignaturaInvalidos } from '../../test/tasks/IngresarDatosAsignaturaInvalidos';
import { IniciarSesion } from '../../test/tasks/IniciarSesion';
import { NavegarAAsignaturas } from '../../test/tasks/NavegarAAsignaturas';
import { RegistrarNuevaAsignatura } from '../../test/tasks/RegistrarNuevaAsignatura';
import { AcademicLoadUI } from '../../test/ui/AcademicLoadUI';

let academicLoadContext: AcademicLoadTestContext;

Given(
  'que {actor} abre la aplicación e inicia sesión con su cuenta de créditos',
  async (actor: Actor) => {
    academicLoadContext = await getOrCreateAcademicLoadContext();
    await actor.attemptsTo(
      IniciarSesion.conCredenciales(academicLoadContext.email, academicLoadContext.password)
    );
  }
);

When('{pronoun} navega a la sección de asignaturas', async (actor: Actor) => {
  await actor.attemptsTo(NavegarAAsignaturas.enLaPlataforma());
});

Then('el semáforo de carga indica el estado {string}', async (estadoEsperado: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Wait.upTo(Duration.ofSeconds(10)).until(
      AcademicLoadQuestions.estadoSemaforo(),
      includes(estadoEsperado)
    ),
    Ensure.that(AcademicLoadQuestions.estadoSemaforo(), includes(estadoEsperado))
  );
});

Then(
  'el paso del semáforo correspondiente a carga balanceada se encuentra activo',
  async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Ensure.that(AcademicLoadQuestions.esPasoBalanceadoActivo(), equals(true))
    );
  }
);

Then('el indicador de créditos totales refleja {string}', async (creditosEsperados: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(AcademicLoadQuestions.creditosTotales(), includes(creditosEsperados))
  );
});

When(
  '{pronoun} inscribe una nueva asignatura {string} con profesor {string} y {int} créditos',
  async (actor: Actor, nombre: string, profesor: string, creditos: number) => {
    await actor.attemptsTo(
      RegistrarNuevaAsignatura.conDatos(nombre, profesor, creditos.toString())
    );
  }
);

Then('el semáforo transiciona reactivamente a {string}', async (estadoEsperado: string) => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Wait.upTo(Duration.ofSeconds(10)).until(
      AcademicLoadQuestions.estadoSemaforo(),
      includes(estadoEsperado)
    ),
    Ensure.that(AcademicLoadQuestions.estadoSemaforo(), includes(estadoEsperado))
  );
});

Then(
  'el indicador de créditos totales se actualiza a {string}',
  async (creditosEsperados: string) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(10)).until(
        AcademicLoadQuestions.creditosTotales(),
        includes(creditosEsperados)
      ),
      Ensure.that(AcademicLoadQuestions.creditosTotales(), includes(creditosEsperados))
    );
  }
);

Then('el paso del semáforo para sobrecarga se activa', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Wait.upTo(Duration.ofSeconds(10)).until(
      AcademicLoadQuestions.esPasoSobrecargaActivo(),
      equals(true)
    ),
    Ensure.that(AcademicLoadQuestions.esPasoSobrecargaActivo(), equals(true))
  );
});

When(
  '{pronoun} intenta inscribir una asignatura con créditos inválidos {string}',
  async (actor: Actor, creditos: string) => {
    await actor.attemptsTo(
      IngresarDatosAsignaturaInvalidos.conCreditos(
        'Materia Fuera Rango',
        'Profesor Fuera Rango',
        creditos
      )
    );
  }
);

Then(
  'el formulario bloquea el registro con un mensaje de validación de créditos',
  async () => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      Ensure.that(AcademicLoadQuestions.cantidadErroresValidacion(), isGreaterThan(0))
    );
  }
);

Then('el botón de guardar asignatura se encuentra deshabilitado', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    Ensure.that(AcademicLoadUI.botonGuardarModal(), not(isEnabled()))
  );
});

// API Steps
Given(
  'que el usuario Api dispone de un token de autenticación para consultar carga académica',
  async () => {
    actorCalled('Api');
    academicLoadContext = await getOrCreateAcademicLoadContext();
  }
);

When('el usuario Api solicita el resumen de carga semanal', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(
    GestionarCargaAcademicaApi.consultarCarga(academicLoadContext.token)
  );
});

When('el usuario Api solicita el resumen de carga semanal sin token de autorización', async () => {
  const actor = actorInTheSpotlight();
  await actor.attemptsTo(GestionarCargaAcademicaApi.consultarCargaSinToken());
});

When(
  'el usuario Api intenta registrar una asignatura con {int} créditos mediante la API',
  async (creditos: number) => {
    const actor = actorInTheSpotlight();
    await actor.attemptsTo(
      GestionarCargaAcademicaApi.intentarCrearAsignaturaConCreditosInvalidos(
        creditos,
        academicLoadContext.token
      )
    );
  }
);
