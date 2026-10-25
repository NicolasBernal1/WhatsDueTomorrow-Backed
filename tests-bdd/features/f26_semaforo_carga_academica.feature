# language: es
@f26 @creditos @semaforo
Característica: F26 - Gestión de créditos académicos y semáforo de carga semanal
  Como estudiante universitario
  Quiero monitorear mis créditos totales y horas de dedicación semanal
  Para balancear mi carga lectiva y prevenir sobrecargas académicas

  @smoke @exitoso
  Escenario: Carga académica balanceada con visualización de semáforo tricolor
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de créditos
    Cuando ella navega a la sección de asignaturas
    Entonces el semáforo de carga indica el estado "Balanced load"
    Y el paso del semáforo correspondiente a carga balanceada se encuentra activo
    Y el indicador de créditos totales refleja "15 credits"

  @alternativo @sobrecarga
  Escenario: Transición reactiva a estado de sobrecarga tras registrar una nueva asignatura
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de créditos
    Cuando ella navega a la sección de asignaturas
    Y ella inscribe una nueva asignatura "Inteligencia Artificial" con profesor "Dr Turing" y 5 créditos
    Entonces el semáforo transiciona reactivamente a "Overload"
    Y el indicador de créditos totales se actualiza a "20 credits"
    Y el paso del semáforo para sobrecarga se activa

  @error @validacion
  Escenario: Validación de límites de créditos académicos en el formulario de registro
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de créditos
    Cuando ella navega a la sección de asignaturas
    Y ella intenta inscribir una asignatura con créditos inválidos "15"
    Entonces el formulario bloquea el registro con un mensaje de validación de créditos
    Y el botón de guardar asignatura se encuentra deshabilitado

  @api @seguridad
  Escenario: Consulta de carga académica con cálculo de métricas y denegación sin autenticación
    Dado que el usuario Api dispone de un token de autenticación para consultar carga académica
    Cuando el usuario Api solicita el resumen de carga semanal
    Entonces la respuesta HTTP del servidor tiene código 200
    Cuando el usuario Api solicita el resumen de carga semanal sin token de autorización
    Entonces la respuesta HTTP del servidor tiene código 401
    Cuando el usuario Api intenta registrar una asignatura con 15 créditos mediante la API
    Entonces la respuesta HTTP del servidor tiene código 400
