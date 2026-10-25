import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, isVisible } from '@serenity-js/web';

import { SubtasksUI } from '../ui/SubtasksUI';

export const CompletarSubtarea = {
  llamada: (titulo: string) => Task.where(
    `#actor marca como completada la subtarea "${titulo}"`,
    Wait.upTo(Duration.ofSeconds(10)).until(SubtasksUI.checkboxSubtareaPorTitulo(titulo), isVisible()),
    Click.on(SubtasksUI.checkboxSubtareaPorTitulo(titulo)),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
