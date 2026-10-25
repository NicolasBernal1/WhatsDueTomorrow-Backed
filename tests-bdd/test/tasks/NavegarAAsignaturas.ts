import { Duration, Task, Wait } from '@serenity-js/core';
import { isVisible, Navigate, Scroll } from '@serenity-js/web';
import { AcademicLoadUI } from '../ui/AcademicLoadUI';

export const NavegarAAsignaturas = {
  enLaPlataforma: () => Task.where(
    `#actor navega a la vista de asignaturas para consultar la carga académica`,
    Navigate.to('/subjects'),
    Wait.upTo(Duration.ofSeconds(10)).until(AcademicLoadUI.seccionCargaAcademica(), isVisible()),
    Scroll.to(AcademicLoadUI.seccionCargaAcademica()),
    Wait.for(Duration.ofSeconds(1)),
  ),
};
