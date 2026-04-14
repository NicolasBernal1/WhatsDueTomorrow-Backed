import { HttpException, HttpStatus } from "@nestjs/common";

export class ContradictoryTimeException extends HttpException{
  constructor(){
    super('No se puede tener un fin de clase antes del inicio!', HttpStatus.CONFLICT);
  }
}