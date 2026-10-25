import { Duration, Task, Wait } from '@serenity-js/core';
import { Click, Enter, Scroll, isVisible } from '@serenity-js/web';

import { NotesUI } from '../ui/NotesUI';

export const RegistrarApunte = {
  conDatos: (titulo: string, contenido: string, enlace?: string) => Task.where(
    `#actor registra un nuevo apunte con título "${ titulo }"`,
    Scroll.to(NotesUI.botonCrearPrimerApunte()),
    Wait.upTo(Duration.ofSeconds(10)).until(NotesUI.botonCrearPrimerApunte(), isVisible()),
    Click.on(NotesUI.botonCrearPrimerApunte()),
    Wait.upTo(Duration.ofSeconds(10)).until(NotesUI.campoTituloModal(), isVisible()),
    Enter.theValue(titulo).into(NotesUI.campoTituloModal()),
    Enter.theValue(contenido).into(NotesUI.campoContenidoModal()),
    ...(enlace ? [Enter.theValue(enlace).into(NotesUI.campoEnlaceModal())] : []),
    Click.on(NotesUI.botonGuardarModal()),
    Wait.for(Duration.ofSeconds(2)),
  ),
};
