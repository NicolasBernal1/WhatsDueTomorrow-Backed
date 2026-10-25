import { By, PageElement, PageElements } from '@serenity-js/web';

export const NotesUI = {
  seccionBitacora: () =>
    PageElement.located(By.css('.bitacora-section')).describedAs('sección de bitácora de apuntes'),

  botonCrearPrimerApunte: () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "actions")]//button[contains(normalize-space(), "+ Add Note")]')
    ).describedAs('botón para abrir modal de nuevo apunte'),

  modalApunte: () =>
    PageElement.located(By.css('mat-card.modal')).describedAs('modal de creación o edición de apunte'),

  campoTituloModal: () =>
    PageElement.located(By.css('app-note-modal input[formControlName="title"]')).describedAs('campo de título en modal de apunte'),

  campoContenidoModal: () =>
    PageElement.located(By.css('app-note-modal textarea[formControlName="content"]')).describedAs('campo de descripción en modal de apunte'),

  campoEnlaceModal: () =>
    PageElement.located(By.css('app-note-modal input[formControlName="linkUrl"]')).describedAs('campo de enlace web en modal de apunte'),

  botonGuardarModal: () =>
    PageElement.located(By.css('app-note-modal button[type="submit"]')).describedAs('botón para guardar apunte en modal'),

  tarjetasApuntes: () =>
    PageElements.located(By.css('.note-card')).describedAs('tarjetas de apuntes en la bitácora'),

  tituloPrimerApunte: () =>
    PageElements.located(By.css('.note-card .note-title')).first().describedAs('título del primer apunte'),

  contenidoPrimerApunte: () =>
    PageElements.located(By.css('.note-card .note-content')).first().describedAs('contenido del primer apunte'),

  enlacePrimerApunte: () =>
    PageElements.located(By.css('.note-card a.note-link')).first().describedAs('enlace externo del primer apunte'),

  botonEditarPrimerApunte: () =>
    PageElement.located(
      By.xpath('(//mat-card[contains(@class, "note-card")]//button[contains(normalize-space(), "Edit")])[1]')
    ).describedAs('botón editar del primer apunte'),

  botonEliminarPrimerApunte: () =>
    PageElement.located(
      By.xpath('(//mat-card[contains(@class, "note-card")]//button[contains(normalize-space(), "Delete")])[1]')
    ).describedAs('botón eliminar del primer apunte'),

  mensajeBitacoraVacia: () =>
    PageElement.located(By.css('.empty-bitacora h4')).describedAs('mensaje informativo de bitácora vacía'),
};
