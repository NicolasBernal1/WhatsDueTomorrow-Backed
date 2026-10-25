# language: es
@f21 @radar @screenplay
Característica: F21 - Alertas y radar de entregas urgentes
  Como estudiante universitario
  Quiero monitorear mis entregas urgentes en una vista dedicada
  Para priorizar mis compromisos académicos de las próximas 24 horas

  @smoke @exitoso
  Escenario: Visualización de la vista del radar de entregas urgentes
    Dado que Alicia abre la aplicación e inicia sesión en la plataforma
    Cuando ella consulta el radar de entregas urgentes
    Entonces ella observa el título "Urgent assignments radar"
    Y el radar de entregas urgentes está visible en pantalla

  @alternativo @radar_vacio
  Escenario: Radar despejado cuando no existen entregas urgentes
    Dado que Alicia abre la aplicación e inicia sesión en la plataforma
    Cuando ella consulta el radar de entregas urgentes
    Entonces el radar muestra el mensaje "No urgent assignments"
    Y la descripción indica "You have no pending assignments due within the next 24 hours."

  @alternativo @alertas
  Escenario: Solicitud de activación de alertas web en el radar
    Dado que Alicia abre la aplicación e inicia sesión en la plataforma
    Cuando ella consulta el radar de entregas urgentes
    Y ella activa las alertas web en el radar
    Entonces el sistema despliega una notificación sobre las alertas web

  @api @seguridad @error
  Escenario: Denegación de acceso no autenticado al endpoint del radar
    Cuando el actor Api solicita las entregas urgentes sin token de autorización
    Entonces la respuesta HTTP del servidor tiene código 401
