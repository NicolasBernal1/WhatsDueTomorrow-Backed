import { By, PageElement, PageElements } from '@serenity-js/web';

export class EvaluationsUI {
  // Botones para abrir el modal de evaluación
  static botonNuevoGradoHeader = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "actions")]//button[contains(normalize-space(), "+ Add Grade")]')
    ).describedAs('botón + Add Grade del encabezado');

  static botonNuevaEvaluacionSeccion = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "section-title-bar")]//button[contains(normalize-space(), "+ New Evaluation")]')
    ).describedAs('botón + New Evaluation de la sección de calculadora');

  static botonPrimeraEvaluacionVacio = () =>
    PageElement.located(
      By.xpath('//button[contains(normalize-space(), "Add first evaluation")]')
    ).describedAs('botón Add first evaluation');

  // Modal de evaluación
  static modalEvaluacion = () =>
    PageElement.located(By.css('mat-card.modal')).describedAs('modal de evaluación');

  static campoNombreModal = () =>
    PageElement.located(By.css('app-evaluation-modal input[formControlName="name"]')).describedAs(
      'campo de nombre de la evaluación'
    );

  static campoPesoModal = () =>
    PageElement.located(By.css('app-evaluation-modal input[formControlName="weight"]')).describedAs(
      'campo de porcentaje/peso de la evaluación'
    );

  static campoNotaModal = () =>
    PageElement.located(By.css('app-evaluation-modal input[formControlName="score"]')).describedAs(
      'campo de calificación obtenida'
    );

  static botonGuardarModal = () =>
    PageElement.located(By.css('app-evaluation-modal button[type="submit"]')).describedAs(
      'botón guardar evaluación'
    );

  static mensajesErrorModal = () =>
    PageElements.located(By.css('app-evaluation-modal mat-hint.error')).describedAs(
      'mensajes de error de validación en modal'
    );

  static alertaPesoExcedido = () =>
    PageElement.located(By.css('app-evaluation-modal .weight-warning')).describedAs(
      'alerta de peso acumulado superior al 100%'
    );

  // Sección Calculadora y Tarjetas de Métricas
  static seccionCalculadora = () =>
    PageElement.located(By.css('.calculator-section')).describedAs('sección de calculadora de calificaciones');

  static tarjetaPromedioPonderado = () =>
    PageElement.located(
      By.xpath('//mat-card[contains(@class, "metric-card")][contains(., "Current Weighted Average")]//span[contains(@class, "metric-value")]')
    ).describedAs('valor de promedio ponderado actual');

  static tarjetaPuntosAcumulados = () =>
    PageElement.located(
      By.xpath('//mat-card[contains(@class, "metric-card")][contains(., "Accumulated Points")]//span[contains(@class, "metric-value")]')
    ).describedAs('valor de puntos acumulados');

  static tarjetaPesoEvaluado = () =>
    PageElement.located(
      By.xpath('//mat-card[contains(@class, "metric-card")][contains(., "Evaluated Weight")]//span[contains(@class, "metric-value")]')
    ).describedAs('valor de peso acumulado evaluado');

  static chipEstadoAcademico = () =>
    PageElement.located(By.css('.status-chip')).describedAs('chip de estado académico');

  // Simulador de Escenarios
  static tarjetaSimulador = () =>
    PageElement.located(By.css('.simulator-card')).describedAs('tarjeta de simulador de escenarios');

  static campoNotaHipotetica = () =>
    PageElement.located(By.css('#hypotheticalInput')).describedAs('campo de calificación hipotética en simulador');

  static campoMetaCalificacion = () =>
    PageElement.located(By.css('#targetGoalInput')).describedAs('campo de meta de calificación en simulador');

  static valorNotaFinalEstimada = () =>
    PageElement.located(
      By.xpath('//div[contains(@class, "sim-feedback")][contains(., "Estimated final grade")]/strong')
    ).describedAs('nota final estimada proyectada en simulador');
}
