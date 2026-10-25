import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Click, Enter } from '@serenity-js/web';
import { EvaluationsUI } from '../ui/EvaluationsUI';
import { AbrirModalEvaluacion } from './AbrirModalEvaluacion';

export const RegistrarEvaluacion = {
  conDatos: (nombre: string, peso: string, nota: string) => Task.where(
    `#actor registra la evaluación "${nombre}" con peso ${peso}% y nota ${nota}`,
    AbrirModalEvaluacion.enPantalla(),
    Clear.theValueOf(EvaluationsUI.campoNombreModal()),
    Enter.theValue(nombre).into(EvaluationsUI.campoNombreModal()),
    Clear.theValueOf(EvaluationsUI.campoPesoModal()),
    Enter.theValue(peso).into(EvaluationsUI.campoPesoModal()),
    Clear.theValueOf(EvaluationsUI.campoNotaModal()),
    Enter.theValue(nota).into(EvaluationsUI.campoNotaModal()),
    Click.on(EvaluationsUI.botonGuardarModal()),
    Wait.for(Duration.ofSeconds(2)),
  ),
};
