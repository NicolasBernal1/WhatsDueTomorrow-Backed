# language: es
@f24 @apuntes @screenplay
Característica: F24 - Bitácora de apuntes y recursos rápidos por asignatura
  Como estudiante universitario
  Quiero registrar apuntes, resúmenes y enlaces externos en mis asignaturas
  Para mantener mis recursos académicos centralizados y accesibles

  @smoke @exitoso
  Escenario: Creación interactiva de apunte con recurso externo en la interfaz de usuario
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de bitácora
    Cuando ella navega al detalle de su asignatura
    Y ella registra un apunte con título "Fórmulas de Gradiente y Rotacional", contenido "El gradiente apunta a la dirección de máxima tasa" y enlace "https://ocw.mit.edu/courses/mathematics/gradient-notes"
    Entonces el apunte aparece visible en la bitácora con el título "Fórmulas de Gradiente y Rotacional"
    Y el contenido del apunte contiene "El gradiente apunta a la dirección de máxima tasa"
    Y el enlace externo apunta a "https://ocw.mit.edu/courses/mathematics/gradient-notes"
    Y el enlace externo tiene los atributos de seguridad para abrir en nueva pestaña

  @alternativo @edicion
  Escenario: Actualización y edición interactiva del contenido de un apunte existente
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de bitácora
    Y Alicia tiene un apunte registrado previamente en la asignatura
    Cuando ella navega al detalle de su asignatura
    Y ella actualiza el contenido del apunte a "Actualizado: Incluye el Teorema de Stokes y cálculo de flujo rotacional"
    Entonces el contenido del apunte contiene "Teorema de Stokes"

  @api @exitoso @regresion
  Escenario: Orden cronológico descendente en la consulta de bitácora vía API
    Dado que el usuario Api cuenta con una asignatura registrada para la bitácora
    Cuando el usuario Api registra un primer apunte titulado "Apunte Cronológico A"
    Y el usuario Api registra un segundo apunte titulado "Apunte Cronológico B Reciente"
    Y el usuario Api consulta los apuntes de la asignatura
    Entonces la respuesta HTTP del servidor tiene código 200
    Y el primer apunte en la lista es "Apunte Cronológico B Reciente"
    Y los apuntes mantienen orden cronológico descendente por fecha de creación

  @api @seguridad @anti-idor
  Escenario: Rechazo de URLs con protocolos inseguros y aislamiento de bitácora entre usuarios
    Dado que el usuario Api cuenta con una asignatura registrada para la bitácora
    Cuando el usuario Api intenta registrar un apunte con protocolo peligroso "javascript:alert(document.cookie)"
    Entonces la respuesta HTTP del servidor tiene código 400
    Cuando el usuario Atacante intenta consultar la bitácora de la asignatura ajena
    Entonces el servidor rechaza el acceso ajeno con código 403 o 404
