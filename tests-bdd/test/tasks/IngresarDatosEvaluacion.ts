import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Enter } from '@serenity-js/web';
import { EvaluationsUI } from '../ui/EvaluationsUI';
import { AbrirModalEvaluacion } from './AbrirModalEvaluacion';

export const IngresarDatosEvaluacion = {
  conValores: (nombre: string, peso: string, nota: string) => Task.where(
    `#actor ingresa valores en la evaluación: "${nombre}", peso ${peso}%, nota ${nota}`,
    AbrirModalEvaluacion.enPantalla(),
    Clear.theValueOf(EvaluationsUI.campoNombreModal()),
    Enter.theValue(nombre).into(EvaluationsUI.campoNombreModal()),
    Clear.theValueOf(EvaluationsUI.campoPesoModal()),
    Enter.theValue(peso).into(EvaluationsUI.campoPesoModal()),
    Clear.theValueOf(EvaluationsUI.campoNotaModal()),
    Enter.theValue(nota).into(EvaluationsUI.campoNotaModal()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
