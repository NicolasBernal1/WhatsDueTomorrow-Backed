# language: es
@f25 @calificaciones @simulador
Característica: F25 - Calculadora y simulador de calificaciones por asignatura
  Como estudiante universitario
  Quiero registrar mis evaluaciones ponderadas y simular calificaciones requeridas
  Para conocer con exactitud matemática mi promedio acumulado y proyectar mi meta académica

  @smoke @exitoso
  Escenario: Registro de calificación y recálculo ponderado en la interfaz de usuario
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de calificaciones
    Cuando ella ingresa a la vista de su asignatura
    Y ella registra la evaluación "Primer Examen Parcial" con peso 30% y calificación 4.5
    Entonces el promedio ponderado se actualiza a "4.50"
    Y los puntos acumulados reflejan "1.35"
    Y el peso evaluado refleja "30.00%"
    Y el estado académico indica "Aprobando"

  @alternativo @simulador
  Escenario: Simulación reactiva de calificación hipotética en el simulador interactivo
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de calificaciones
    Y ella dispone de una evaluación inicial registrada en su asignatura
    Cuando ella ingresa a la vista de su asignatura
    Y ella ingresa una calificación hipotética de "4.0" en el simulador de escenarios
    Entonces el simulador proyecta una nota final estimada de "4.15"

  @error @validacion
  Escenario: Validación de límites de dominio y bloqueo del formulario ante notas o porcentajes fuera de rango
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de calificaciones
    Cuando ella ingresa a la vista de su asignatura
    Y ella intenta registrar una evaluación con nombre "Evaluación Inválida", peso 110% y calificación 5.8
    Entonces el formulario bloquea el registro con mensajes de validación
    Y el botón de guardar se encuentra deshabilitado

  @api @seguridad @anti-idor
  Escenario: Aislamiento multiusuario y denegación de acceso o registro en asignaturas ajenas (Anti-IDOR)
    Dado que el usuario Api dispone de una asignatura configurada con calificaciones
    Cuando un usuario atacante intenta consultar las evaluaciones de dicha asignatura
    Entonces la respuesta HTTP del servidor deniega el acceso a notas con código 403 o 404
    Y cuando el usuario atacante intenta registrar una evaluación en dicha asignatura
    Entonces la respuesta HTTP del servidor deniega el registro de notas con código 403 o 404
