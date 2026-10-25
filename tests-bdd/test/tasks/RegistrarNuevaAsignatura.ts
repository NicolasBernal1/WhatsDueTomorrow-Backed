import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Click, Enter } from '@serenity-js/web';
import { AcademicLoadUI } from '../ui/AcademicLoadUI';
import { AbrirModalNuevaAsignatura } from './AbrirModalNuevaAsignatura';

export const RegistrarNuevaAsignatura = {
  conDatos: (nombre: string, profesor: string, creditos: string) => Task.where(
    `#actor inscribe la asignatura "${nombre}" con profesor "${profesor}" y ${creditos} créditos`,
    AbrirModalNuevaAsignatura.enPantalla(),
    Clear.theValueOf(AcademicLoadUI.campoNombreModal()),
    Enter.theValue(nombre).into(AcademicLoadUI.campoNombreModal()),
    Clear.theValueOf(AcademicLoadUI.campoProfesorModal()),
    Enter.theValue(profesor).into(AcademicLoadUI.campoProfesorModal()),
    Clear.theValueOf(AcademicLoadUI.campoCreditosModal()),
    Enter.theValue(creditos).into(AcademicLoadUI.campoCreditosModal()),
    Click.on(AcademicLoadUI.botonGuardarModal()),
    Wait.for(Duration.ofSeconds(2)),
  ),
};
