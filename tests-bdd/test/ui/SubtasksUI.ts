import { By, PageElement, PageElements } from '@serenity-js/web';

export const SubtasksUI = {
  contenedorPrincipal: () =>
    PageElement.located(By.css('main.assignment-details')).describedAs('contenedor principal de la entrega'),

  tituloEntrega: () =>
    PageElement.located(By.css('main.assignment-details h1')).describedAs('título de la entrega'),

  etiquetaProgreso: () =>
    PageElement.located(By.css('.progress-label strong')).describedAs('porcentaje de progreso de la entrega'),

  barraProgreso: () =>
    PageElement.located(By.css('mat-progress-bar')).describedAs('barra de progreso de la entrega'),

  mensajeCompletitud: () =>
    PageElement.located(By.css('.completion-tip')).describedAs('mensaje de felicitación al completar 100%'),

  campoNuevaSubtarea: () =>
    PageElement.located(By.css('input[aria-label="New subtask"]')).describedAs('campo de texto para nueva subtarea'),

  botonAgregarSubtarea: () =>
    PageElement.located(By.css('.new-subtask button')).describedAs('botón Add subtarea'),

  listaSubtareas: () =>
    PageElements.located(By.css('.subtask-item')).describedAs('lista de subtareas'),

  primeraSubtarea: () =>
    PageElement.located(By.css('.subtask-item:first-child')).describedAs('primera subtarea de la lista'),

  ultimaSubtarea: () =>
    PageElement.located(By.css('.subtask-item:last-child')).describedAs('última subtarea de la lista'),

  checkboxSubtareaPorTitulo: (titulo: string) =>
    PageElement.located(
      By.xpath(`//mat-card[contains(@class, "subtask-item") and .//span[contains(text(), "${titulo}")]]//mat-checkbox`)
    ).describedAs(`checkbox de la subtarea "${titulo}"`),

  botonEliminarUltimaSubtarea: () =>
    PageElements.located(By.css('.subtask-item button[aria-label="Delete"]'))
      .last()
      .describedAs('botón eliminar última subtarea'),

  mensajeVacio: () =>
    PageElement.located(By.css('.subtasks-section .empty')).describedAs('mensaje de lista de subtareas vacía'),
};
