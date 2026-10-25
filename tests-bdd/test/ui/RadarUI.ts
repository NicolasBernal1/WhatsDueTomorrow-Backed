import { By, PageElement, PageElements } from '@serenity-js/web';

export const RadarUI = {
  titulo: () =>
    PageElement.located(By.css('#radar-title')).describedAs('título del radar de entregas urgentes'),

  botonAlertasWeb: () =>
    PageElement.located(By.css('.radar-header button')).describedAs('botón habilitar alertas web'),

  mensajeNotificacion: () =>
    PageElement.located(By.css('.notification-message')).describedAs('mensaje de notificación de alerta'),

  contenedorVacio: () =>
    PageElement.located(By.css('.empty-radar')).describedAs('sección de radar vacío'),

  tituloVacio: () =>
    PageElement.located(By.css('.empty-radar h2')).describedAs('título de radar vacío'),

  descripcionVacio: () =>
    PageElement.located(By.css('.empty-radar p')).describedAs('descripción de radar vacío'),

  tarjetasUrgentes: () =>
    PageElements.located(By.css('.urgent-card')).describedAs('tarjetas de entregas urgentes'),
};
