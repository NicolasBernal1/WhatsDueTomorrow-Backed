import { defineParameterType } from '@cucumber/cucumber';
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';

defineParameterType({
  name: 'actor',
  regexp: /[A-ZÁÉÍÓÚÑ][a-záéíóúñA-Z0-9_]+/,
  transformer: (name: string) => actorCalled(name),
});

defineParameterType({
  name: 'pronoun',
  regexp: /él|ella|ellos|ellas/,
  transformer: () => actorInTheSpotlight(),
});
