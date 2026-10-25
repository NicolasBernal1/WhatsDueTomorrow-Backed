import { Duration, Task, Wait } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { SubtasksUI } from '../ui/SubtasksUI';

export const EliminarUltimaSubtarea = {
  deLaLista: () => Task.where(
    '#actor elimina la última subtarea de la lista',
    Click.on(SubtasksUI.botonEliminarUltimaSubtarea()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
