import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Click, Enter, Scroll, isVisible } from '@serenity-js/web';

import { NotesUI } from '../ui/NotesUI';

export const EditarApunte = {
  conNuevoContenido: (nuevoContenido: string) => Task.where(
    '#actor actualiza el contenido del apunte existente',
    Scroll.to(NotesUI.botonEditarPrimerApunte()),
    Wait.upTo(Duration.ofSeconds(10)).until(NotesUI.botonEditarPrimerApunte(), isVisible()),
    Click.on(NotesUI.botonEditarPrimerApunte()),
    Wait.upTo(Duration.ofSeconds(10)).until(NotesUI.campoContenidoModal(), isVisible()),
    Clear.theValueOf(NotesUI.campoContenidoModal()),
    Enter.theValue(nuevoContenido).into(NotesUI.campoContenidoModal()),
    Click.on(NotesUI.botonGuardarModal()),
    Wait.for(Duration.ofSeconds(2)),
  ),
};
