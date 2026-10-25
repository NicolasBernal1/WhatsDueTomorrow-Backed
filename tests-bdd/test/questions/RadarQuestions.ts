import { Text } from '@serenity-js/web';

import { RadarUI } from '../ui/RadarUI';

export const RadarQuestions = {
  titulo: () => Text.of(RadarUI.titulo()),
  tituloVacio: () => Text.of(RadarUI.tituloVacio()),
  descripcionVacio: () => Text.of(RadarUI.descripcionVacio()),
  mensajeNotificacion: () => Text.of(RadarUI.mensajeNotificacion()),
};
