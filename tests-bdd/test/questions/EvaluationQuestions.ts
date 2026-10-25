import { Question } from '@serenity-js/core';
import { Attribute, Text } from '@serenity-js/web';
import { EvaluationsUI } from '../ui/EvaluationsUI';

export class EvaluationQuestions {
  static promedioPonderado(): Question<Promise<string>> {
    return Question.about('promedio ponderado actual', async (actor) => {
      const texto = await actor.answer(Text.of(EvaluationsUI.tarjetaPromedioPonderado()));
      return texto.trim();
    });
  }

  static puntosAcumulados(): Question<Promise<string>> {
    return Question.about('puntos acumulados', async (actor) => {
      const texto = await actor.answer(Text.of(EvaluationsUI.tarjetaPuntosAcumulados()));
      return texto.trim();
    });
  }

  static pesoEvaluado(): Question<Promise<string>> {
    return Question.about('peso acumulado evaluado', async (actor) => {
      const texto = await actor.answer(Text.of(EvaluationsUI.tarjetaPesoEvaluado()));
      return texto.trim();
    });
  }

  static estadoAcademico(): Question<Promise<string>> {
    return Question.about('estado académico', async (actor) => {
      const texto = await actor.answer(Text.of(EvaluationsUI.chipEstadoAcademico()));
      return texto.trim();
    });
  }

  static notaFinalEstimada(): Question<Promise<string>> {
    return Question.about('nota final estimada en el simulador', async (actor) => {
      const texto = await actor.answer(Text.of(EvaluationsUI.valorNotaFinalEstimada()));
      return texto.trim();
    });
  }

  static botonGuardarHabilitado(): Question<Promise<boolean>> {
    return Question.about('si el botón de guardar está habilitado', async (actor) => {
      const disabledAttr = await actor.answer(
        Attribute.called('disabled').of(EvaluationsUI.botonGuardarModal())
      );
      return disabledAttr === null || disabledAttr === undefined;
    });
  }

  static cantidadErroresValidacion(): Question<Promise<number>> {
    return Question.about('cantidad de errores de validación', async (actor) => {
      return actor.answer(EvaluationsUI.mensajesErrorModal().count());
    });
  }
}
