import { Duration, Task, Wait } from '@serenity-js/core';
import { Clear, Enter, isVisible, Scroll } from '@serenity-js/web';
import { EvaluationsUI } from '../ui/EvaluationsUI';

export const SimularEscenarioHipotetico = {
  conNota: (notaHipotetica: string) => Task.where(
    `#actor simula una calificación hipotética de ${notaHipotetica} en el trabajo restante`,
    Wait.upTo(Duration.ofSeconds(10)).until(EvaluationsUI.campoNotaHipotetica(), isVisible()),
    Scroll.to(EvaluationsUI.campoNotaHipotetica()),
    Clear.theValueOf(EvaluationsUI.campoNotaHipotetica()),
    Enter.theValue(notaHipotetica).into(EvaluationsUI.campoNotaHipotetica()),
    Wait.upTo(Duration.ofSeconds(5)).until(EvaluationsUI.valorNotaFinalEstimada(), isVisible()),
  ),
};
