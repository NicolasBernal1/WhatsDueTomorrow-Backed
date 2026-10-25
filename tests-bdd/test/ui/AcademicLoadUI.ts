import { By, PageElement, PageElements } from '@serenity-js/web';

export class AcademicLoadUI {
  // Sección y tarjetas de semáforo de carga
  static seccionCargaAcademica = () =>
    PageElement.located(By.css('.academic-load-section')).describedAs('sección de carga académica semanal');

  static tarjetaCarga = () =>
    PageElement.located(By.css('.load-card')).describedAs('tarjeta de semáforo de carga');

  static textoEstadoCarga = () =>
    PageElement.located(By.css('.status-text')).describedAs('texto de estado del semáforo');

  static pasoSemaforoBaja = () =>
    PageElement.located(By.css('.traffic-step.step-baja')).describedAs('paso de semáforo para carga baja');

  static pasoSemaforoBalanceada = () =>
    PageElement.located(By.css('.traffic-step.step-balanceada')).describedAs(
      'paso de semáforo para carga balanceada'
    );

  static pasoSemaforoSobrecarga = () =>
    PageElement.located(By.css('.traffic-step.step-sobrecarga')).describedAs(
      'paso de semáforo para sobrecarga'
    );

  // Estadísticas desglosadas
  static cifraCreditosTotales = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "stat-box")][contains(., "Total Credits")]//span[contains(@class, "stat-number")]')
    ).describedAs('cifra de créditos totales');

  static cifraHorasPresenciales = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "stat-box")][contains(., "Weekly Class Hours")]//span[contains(@class, "stat-number")]')
    ).describedAs('cifra de horas presenciales semanales');

  static cifraEstudioIndependiente = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "stat-box")][contains(., "Estimated Independent Study")]//span[contains(@class, "stat-number")]')
    ).describedAs('cifra de estudio independiente estimado');

  // Modal para agregar asignatura
  static botonAbrirModalAsignatura = () =>
    PageElement.located(
      By.xpath('//button[contains(normalize-space(), "+ Add Subject")]')
    ).describedAs('botón + Add Subject');

  static modalNuevaAsignatura = () =>
    PageElement.located(By.css('app-add-subject-modal .modal')).describedAs(
      'modal de nueva asignatura'
    );

  static campoNombreModal = () =>
    PageElement.located(By.css('app-add-subject-modal input[formControlName="name"]')).describedAs(
      'campo nombre de asignatura'
    );

  static campoProfesorModal = () =>
    PageElement.located(By.css('app-add-subject-modal input[formControlName="professor"]')).describedAs(
      'campo profesor de asignatura'
    );

  static campoCreditosModal = () =>
    PageElement.located(By.css('app-add-subject-modal input[formControlName="credits"]')).describedAs(
      'campo créditos de asignatura'
    );

  static botonGuardarModal = () =>
    PageElement.located(By.css('app-add-subject-modal button[type="submit"]')).describedAs(
      'botón guardar asignatura'
    );

  static erroresValidacionModal = () =>
    PageElements.located(By.css('app-add-subject-modal mat-error')).describedAs(
      'mensajes de error de validación en modal'
    );
}
