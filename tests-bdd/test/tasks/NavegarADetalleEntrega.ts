import { Duration, Task, Wait } from '@serenity-js/core';
import { Navigate, isVisible } from '@serenity-js/web';

import { SubtasksUI } from '../ui/SubtasksUI';

export const NavegarADetalleEntrega = {
  conId: (assignmentId: number) => Task.where(
    `#actor navega al detalle de la entrega #${assignmentId}`,
    Navigate.to(`/assignments/${assignmentId}`),
    Wait.upTo(Duration.ofSeconds(15)).until(SubtasksUI.contenedorPrincipal(), isVisible()),
  ),
};
