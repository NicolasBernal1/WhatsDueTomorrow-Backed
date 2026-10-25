import { Duration, Masked, Task, Wait } from '@serenity-js/core';
import { Click, Enter, Navigate, isVisible } from '@serenity-js/web';

import { LoginFormUI } from '../ui/LoginFormUI';

export const IniciarSesion = {
  conCredenciales: (email: string, password: string) => Task.where(
    `#actor inicia sesión con "${ email }"`,
    Navigate.to('/login'),
    Wait.upTo(Duration.ofSeconds(15)).until(LoginFormUI.campoEmail(), isVisible()),
    Enter.theValue(email).into(LoginFormUI.campoEmail()),
    Enter.theValue(Masked.valueOf(password)).into(LoginFormUI.campoPassword()),
    Click.on(LoginFormUI.botonIngresar()),
    Wait.for(Duration.ofSeconds(3)),
  ),
};
