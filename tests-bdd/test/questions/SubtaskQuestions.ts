import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { SubtasksUI } from '../ui/SubtasksUI';

export const SubtaskQuestions = {
  progreso: (): Question<Promise<string>> =>
    Text.of(SubtasksUI.etiquetaProgreso()).describedAs('progreso porcentual de la entrega'),

  mensajeCompletitud: (): Question<Promise<string>> =>
    Text.of(SubtasksUI.mensajeCompletitud()).describedAs('mensaje de felicitación al completar 100%'),

  cantidadSubtareas: (): Question<Promise<number>> =>
    SubtasksUI.listaSubtareas().count().describedAs('cantidad total de subtareas listadas'),

  mensajeVacio: (): Question<Promise<string>> =>
    Text.of(SubtasksUI.mensajeVacio()).describedAs('mensaje de sección de subtareas vacía'),

  botonAgregarHabilitado: (): Question<Promise<boolean>> =>
    SubtasksUI.botonAgregarSubtarea().isEnabled().describedAs('estado habilitado del botón agregar subtarea'),
};
