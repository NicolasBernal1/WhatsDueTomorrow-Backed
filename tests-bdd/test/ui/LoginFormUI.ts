import { By, PageElement } from '@serenity-js/web';

export const LoginFormUI = {
  campoEmail: () =>
    PageElement.located(By.css('input[formControlName="email"]')).describedAs('campo de correo'),

  campoPassword: () =>
    PageElement.located(By.css('input[formControlName="password"]')).describedAs('campo de contraseña'),

  botonIngresar: () =>
    PageElement.located(By.css('button[type="submit"]')).describedAs('botón Log In'),
};
