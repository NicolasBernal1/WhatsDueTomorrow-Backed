import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, isVisible } from '@serenity-js/web';

import { RadarUI } from '../ui/RadarUI';

export const ActivarAlertasWeb = {
  enElRadar: () => Task.where(
    '#actor activa las alertas web en el radar',
    Wait.upTo(Duration.ofSeconds(10)).until(RadarUI.botonAlertasWeb(), isVisible()),
    Click.on(RadarUI.botonAlertasWeb()),
  ),
};
