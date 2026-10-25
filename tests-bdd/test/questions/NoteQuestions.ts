import { Question } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';
import { Attribute, Text } from '@serenity-js/web';

import { NotesUI } from '../ui/NotesUI';

export const NoteQuestions = {
  tituloPrimerApunte: () =>
    Text.of(NotesUI.tituloPrimerApunte()).describedAs('título del primer apunte en la bitácora'),

  contenidoPrimerApunte: () =>
    Text.of(NotesUI.contenidoPrimerApunte()).describedAs('contenido del primer apunte en la bitácora'),

  enlacePrimerApunte: () =>
    Attribute.called('href').of(NotesUI.enlacePrimerApunte()).describedAs('atributo href del enlace de apunte'),

  targetPrimerApunte: () =>
    Attribute.called('target').of(NotesUI.enlacePrimerApunte()).describedAs('atributo target del enlace de apunte'),

  relPrimerApunte: () =>
    Attribute.called('rel').of(NotesUI.enlacePrimerApunte()).describedAs('atributo rel del enlace de apunte'),

  primerTituloDeRespuestaApi: () =>
    Question.about('título del apunte más reciente en la respuesta API', async actor => {
      const body: any = await actor.answer(LastResponse.body<any>());
      return body?.data?.[0]?.title ?? '';
    }),

  ordenCronologicoDescendente: () =>
    Question.about('verificación de orden cronológico descendente (createdAt DESC)', async actor => {
      const body: any = await actor.answer(LastResponse.body<any>());
      const notes = body?.data ?? [];
      if (notes.length < 2) return true;
      const t1 = new Date(notes[0].createdAt).getTime();
      const t2 = new Date(notes[1].createdAt).getTime();
      return t1 >= t2;
    }),
};
