import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Click, Enter, isVisible } from '@serenity-js/web';
import { AcademicLoadUI } from '../ui/AcademicLoadUI';
import { AbrirModalNuevaAsignatura } from './AbrirModalNuevaAsignatura';

export const IngresarDatosAsignaturaInvalidos = {
  conCreditos: (nombre: string, profesor: string, creditos: string) => Task.where(
    `#actor ingresa asignatura inválida "${nombre}" con ${creditos} créditos`,
    AbrirModalNuevaAsignatura.enPantalla(),
    Clear.theValueOf(AcademicLoadUI.campoNombreModal()),
    Enter.theValue(nombre).into(AcademicLoadUI.campoNombreModal()),
    Clear.theValueOf(AcademicLoadUI.campoProfesorModal()),
    Enter.theValue(profesor).into(AcademicLoadUI.campoProfesorModal()),
    Clear.theValueOf(AcademicLoadUI.campoCreditosModal()),
    Enter.theValue(creditos).into(AcademicLoadUI.campoCreditosModal()),
    Click.on(AcademicLoadUI.campoNombreModal()),
    Wait.upTo(Duration.ofSeconds(5)).until(
      AcademicLoadUI.erroresValidacionModal().first(),
      isVisible()
    )
  ),
};
