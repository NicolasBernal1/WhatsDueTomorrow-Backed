import { Duration, Task, Wait } from '@serenity-js/core';
import { Navigate, Scroll, isVisible } from '@serenity-js/web';

import { CalendarUI } from '../ui/CalendarUI';

export const NavegarAHorario = {
  enLaPlataforma: () => Task.where(
    '#actor navega al módulo de horario y sincronización de calendario',
    Navigate.to('/schedule'),
    Scroll.to(CalendarUI.tituloSincronizacion()),
    Wait.upTo(Duration.ofSeconds(15)).until(CalendarUI.tituloSincronizacion(), isVisible()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
