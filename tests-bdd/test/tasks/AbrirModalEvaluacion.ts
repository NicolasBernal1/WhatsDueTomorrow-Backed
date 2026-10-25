import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, isVisible } from '@serenity-js/web';
import { EvaluationsUI } from '../ui/EvaluationsUI';

export const AbrirModalEvaluacion = {
  enPantalla: () => Task.where(
    `#actor abre el modal de registro de evaluación`,
    Click.on(EvaluationsUI.botonNuevoGradoHeader()),
    Wait.upTo(Duration.ofSeconds(10)).until(EvaluationsUI.campoNombreModal(), isVisible()),
  ),
};
