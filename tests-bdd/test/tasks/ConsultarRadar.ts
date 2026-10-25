import { Duration, Task, Wait } from '@serenity-js/core';
import { Navigate, isVisible } from '@serenity-js/web';

import { RadarUI } from '../ui/RadarUI';

export const ConsultarRadar = {
  deEntregasUrgentes: () => Task.where(
    '#actor consulta el radar de entregas urgentes',
    Navigate.to('/urgent-radar'),
    Wait.upTo(Duration.ofSeconds(15)).until(RadarUI.titulo(), isVisible()),
  ),
};
