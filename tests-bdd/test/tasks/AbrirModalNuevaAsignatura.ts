import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, isVisible } from '@serenity-js/web';
import { AcademicLoadUI } from '../ui/AcademicLoadUI';

export const AbrirModalNuevaAsignatura = {
  enPantalla: () => Task.where(
    `#actor abre el modal para agregar una nueva asignatura`,
    Click.on(AcademicLoadUI.botonAbrirModalAsignatura()),
    Wait.upTo(Duration.ofSeconds(10)).until(AcademicLoadUI.campoNombreModal(), isVisible()),
  ),
};
