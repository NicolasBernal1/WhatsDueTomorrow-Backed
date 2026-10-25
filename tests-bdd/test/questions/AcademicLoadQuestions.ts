import { Question } from '@serenity-js/core';
import { Attribute, Text } from '@serenity-js/web';
import { AcademicLoadUI } from '../ui/AcademicLoadUI';

export class AcademicLoadQuestions {
  static estadoSemaforo(): Question<Promise<string>> {
    return Question.about('texto del estado del semáforo de carga', async (actor) => {
      const texto = await actor.answer(Text.of(AcademicLoadUI.textoEstadoCarga()));
      return texto.trim();
    });
  }

  static creditosTotales(): Question<Promise<string>> {
    return Question.about('cifra de créditos totales', async (actor) => {
      const texto = await actor.answer(Text.of(AcademicLoadUI.cifraCreditosTotales()));
      return texto.trim();
    });
  }

  static horasPresenciales(): Question<Promise<string>> {
    return Question.about('horas de clase presenciales semanales', async (actor) => {
      const texto = await actor.answer(Text.of(AcademicLoadUI.cifraHorasPresenciales()));
      return texto.trim();
    });
  }

  static horasEstudioIndependiente(): Question<Promise<string>> {
    return Question.about('horas de estudio independiente estimado', async (actor) => {
      const texto = await actor.answer(Text.of(AcademicLoadUI.cifraEstudioIndependiente()));
      return texto.trim();
    });
  }

  static esPasoBalanceadoActivo(): Question<Promise<boolean>> {
    return Question.about('si el paso de carga balanceada está activo', async (actor) => {
      const clases = await actor.answer(
        Attribute.called('class').of(AcademicLoadUI.pasoSemaforoBalanceada())
      );
      return (clases || '').includes('active');
    });
  }

  static esPasoSobrecargaActivo(): Question<Promise<boolean>> {
    return Question.about('si el paso de sobrecarga está activo', async (actor) => {
      const clases = await actor.answer(
        Attribute.called('class').of(AcademicLoadUI.pasoSemaforoSobrecarga())
      );
      return (clases || '').includes('active');
    });
  }

  static cantidadErroresValidacion(): Question<Promise<number>> {
    return Question.about('cantidad de errores de validación en modal', async (actor) => {
      return actor.answer(AcademicLoadUI.erroresValidacionModal().count());
    });
  }

  static primerMensajeError(): Question<Promise<string>> {
    return Question.about('primer mensaje de error de validación', async (actor) => {
      const texto = await actor.answer(Text.of(AcademicLoadUI.erroresValidacionModal().first()));
      return texto.trim();
    });
  }
}
