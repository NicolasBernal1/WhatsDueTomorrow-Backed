import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateEvaluationDto {
  @IsNotEmpty({ message: 'El nombre de la evaluación es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  name: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje debe ser un número con máximo 2 decimales' },
  )
  @Min(1, { message: 'El porcentaje ponderado mínimo es 1%' })
  @Max(100, { message: 'El porcentaje ponderado máximo es 100%' })
  @Transform(({ value }: { value: unknown }) => Number(value))
  weight: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La calificación debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La calificación mínima es 0.0' })
  @Max(5, { message: 'La calificación máxima es 5.0' })
  @Transform(({ value }: { value: unknown }) => Number(value))
  score: number;
}
