import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateEvaluationDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  name?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje debe ser un número con máximo 2 decimales' },
  )
  @Min(1, { message: 'El porcentaje ponderado mínimo es 1%' })
  @Max(100, { message: 'El porcentaje ponderado máximo es 100%' })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined ? Number(value) : undefined,
  )
  weight?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La calificación debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'La calificación mínima es 0.0' })
  @Max(5, { message: 'La calificación máxima es 5.0' })
  @Transform(({ value }: { value: unknown }) =>
    value !== undefined ? Number(value) : undefined,
  )
  score?: number;
}
