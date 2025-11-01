import { HttpException, HttpStatus } from "@nestjs/common";

export class ExistingUserException extends HttpException{
  constructor(){
    super('Ya hay un usuario registrado con este correo!!', HttpStatus.CONFLICT);
  }
}