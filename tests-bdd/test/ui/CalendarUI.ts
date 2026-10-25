import { By, PageElement } from '@serenity-js/web';

export const CalendarUI = {
  tituloSincronizacion: () =>
    PageElement.located(By.css('#calendar-sync-title')).describedAs('título de la sección de sincronización de calendario'),

  botonSincronizar: () =>
    PageElement.located(By.xpath('//button[contains(normalize-space(), "Sync calendar")]')).describedAs('botón Sync calendar'),

  botonDescargarIcs: () =>
    PageElement.located(By.xpath('//button[contains(normalize-space(), "Download .ics")]')).describedAs('botón Download .ics'),

  enlaceSuscripcion: () =>
    PageElement.located(By.css('input[aria-label="Calendar subscription link"]')).describedAs('campo de enlace de suscripción de calendario'),

  mensajeCalendario: () =>
    PageElement.located(By.css('.calendar-message')).describedAs('mensaje informativo de calendario'),

  botonCopiarEnlace: () =>
    PageElement.located(By.xpath('//button[contains(normalize-space(), "Copy link")]')).describedAs('botón Copy link'),

  contenedorSuscripcion: () =>
    PageElement.located(By.css('.subscription-link')).describedAs('contenedor del enlace de suscripción'),
};
