# language: es
@f23 @calendario @screenplay
Característica: F23 - Sincronización y exportación de calendario .ics
  Como estudiante universitario
  Quiero sincronizar mi calendario académico con aplicaciones externas y exportar archivos .ics
  Para consultar mis clases y fechas de entrega en Google Calendar, Apple Calendar u Outlook

  @smoke @exitoso
  Escenario: Generación de enlace de suscripción Webcal en la interfaz de usuario
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de calendario
    Cuando ella navega al módulo de horario y sincronización
    Y ella genera el enlace de sincronización de calendario
    Entonces el enlace de suscripción comienza con "webcal://"
    Y el sistema muestra el mensaje informativo "Your subscription link is ready"

  @alternativo @portapapeles
  Escenario: Copia del enlace de sincronización al portapapeles
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de calendario
    Cuando ella navega al módulo de horario y sincronización
    Y ella genera el enlace de sincronización de calendario
    Y ella copia el enlace al portapapeles
    Entonces el sistema muestra el mensaje informativo "Subscription link copied. Open it from your calendar app"

  @api @exitoso @rfc5545
  Escenario: Descarga de archivo de calendario .ics conforme al estándar RFC 5545
    Dado que el usuario Api cuenta con un token de autenticación válido
    Cuando el usuario Api solicita la descarga del archivo .ics
    Entonces la respuesta HTTP del servidor tiene código 200
    Y el archivo contiene el bloque canónico "BEGIN:VCALENDAR"
    Y el archivo contiene la especificación de versión "VERSION:2.0"
    Y el archivo finaliza con el bloque canónico "END:VCALENDAR"

  @api @seguridad @error
  Escenario: Denegación de descarga de calendario sin autenticación y rechazo de feed con token inválido
    Cuando el usuario Api solicita la descarga del archivo .ics sin token de autorización
    Entonces la respuesta HTTP del servidor tiene código 401
    Cuando el usuario Api consulta un feed de calendario con token inexistente "tokeninvalido1234567890abcdef"
    Entonces la respuesta HTTP del servidor tiene código 404
