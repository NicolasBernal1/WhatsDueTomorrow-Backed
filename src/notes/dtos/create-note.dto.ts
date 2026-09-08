import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  title: string;

  @IsNotEmpty({ message: 'El contenido descriptivo es obligatorio' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  content: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
  )
  @ValidateIf(
    (o: CreateNoteDto) => o.linkUrl !== null && o.linkUrl !== undefined,
  )
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'El enlace debe ser una URL válida con protocolo http o https' },
  )
  linkUrl?: string | null;
}
