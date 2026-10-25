import { Duration, Task, Wait } from '@serenity-js/core';
import { Navigate, Scroll, isVisible } from '@serenity-js/web';

import { NotesUI } from '../ui/NotesUI';

export const NavegarAAsignatura = {
  conId: (subjectId: number) => Task.where(
    `#actor navega al detalle de la asignatura #${ subjectId }`,
    Navigate.to(`/subjects/${ subjectId }`),
    Scroll.to(NotesUI.seccionBitacora()),
    Wait.upTo(Duration.ofSeconds(15)).until(NotesUI.seccionBitacora(), isVisible()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
