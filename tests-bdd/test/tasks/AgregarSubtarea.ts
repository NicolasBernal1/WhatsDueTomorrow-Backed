import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, Enter, isVisible } from '@serenity-js/web';

import { SubtasksUI } from '../ui/SubtasksUI';

export const AgregarSubtarea = {
  conTitulo: (titulo: string) => Task.where(
    `#actor agrega la subtarea "${titulo}"`,
    Wait.upTo(Duration.ofSeconds(10)).until(SubtasksUI.campoNuevaSubtarea(), isVisible()),
    Enter.theValue(titulo).into(SubtasksUI.campoNuevaSubtarea()),
    Click.on(SubtasksUI.botonAgregarSubtarea()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
