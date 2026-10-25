import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, isVisible } from '@serenity-js/web';

import { CalendarUI } from '../ui/CalendarUI';

export const CopiarEnlaceCalendario = {
  alPortapapeles: () => Task.where(
    '#actor copia el enlace de suscripción al portapapeles',
    Wait.upTo(Duration.ofSeconds(10)).until(CalendarUI.botonCopiarEnlace(), isVisible()),
    Click.on(CalendarUI.botonCopiarEnlace()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
