import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, Scroll, isVisible } from '@serenity-js/web';

import { CalendarUI } from '../ui/CalendarUI';

export const SincronizarCalendario = {
  generarEnlace: () => Task.where(
    '#actor genera el enlace de suscripción webcal del calendario',
    Scroll.to(CalendarUI.botonSincronizar()),
    Wait.upTo(Duration.ofSeconds(15)).until(CalendarUI.botonSincronizar(), isVisible()),
    Wait.for(Duration.ofMilliseconds(500)),
    Click.on(CalendarUI.botonSincronizar()),
    Wait.upTo(Duration.ofSeconds(20)).until(CalendarUI.enlaceSuscripcion(), isVisible()),
  ),
};
