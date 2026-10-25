# language: es
@f22 @subtareas @screenplay
Característica: F22 - Desglose de tareas en subtareas con avance porcentual
  Como estudiante universitario
  Quiero dividir mis entregas académicas en subtareas y marcar su avance
  Para monitorear el porcentaje de completitud y gestionar mi progreso de forma secuencial

  @smoke @exitoso
  Escenario: Creación de subtareas y actualización del progreso al 100%
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de entregas
    Y Alicia tiene una entrega registrada para gestionar subtareas
    Cuando ella navega al detalle de su entrega
    Y ella agrega las siguientes subtareas:
      | Definir alcance del proyecto |
      | Implementar arquitectura     |
    Entonces el progreso de la entrega indica "0%"
    Cuando ella marca como completada la subtarea "Definir alcance del proyecto"
    Entonces el progreso de la entrega indica "50%"
    Cuando ella marca como completada la subtarea "Implementar arquitectura"
    Entonces el progreso de la entrega indica "100%"
    Y el sistema despliega el mensaje de completitud "You completed all the steps. You can now mark the assignment as completed."

  @alternativo @reordenamiento
  Escenario: Eliminación de una subtarea y recálculo del avance
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de entregas
    Y Alicia tiene una entrega registrada para gestionar subtareas
    Cuando ella navega al detalle de su entrega
    Y ella agrega las siguientes subtareas:
      | Subtarea temporal para descartar |
    Y ella elimina la última subtarea de la lista
    Entonces el sistema actualiza la lista de subtareas

  @error @validacion
  Escenario: Inhabilitación del botón de agregar ante texto vacío o espacios
    Dado que Alicia abre la aplicación e inicia sesión con su cuenta de entregas
    Y Alicia tiene una entrega registrada para gestionar subtareas
    Cuando ella navega al detalle de su entrega
    Y ella escribe solo espacios en el campo de nueva subtarea
    Entonces el botón de agregar subtarea permanece deshabilitado

  @api @seguridad @anti_idor
  Escenario: Denegación de acceso y modificación de subtareas ajenas por otro usuario
    Dado que Alicia tiene una subtarea creada en la plataforma
    Cuando el usuario Atacante intenta modificar la subtarea ajena
    Entonces el servidor rechaza la modificación con código 403
