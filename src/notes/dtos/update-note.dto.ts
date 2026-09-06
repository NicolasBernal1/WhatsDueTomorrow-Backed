import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  title?: string;

  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : '',
  )
  content?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : null,
  )
  @ValidateIf(
    (o: UpdateNoteDto) => o.linkUrl !== null && o.linkUrl !== undefined,
  )
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'El enlace debe ser una URL válida con protocolo http o https' },
  )
  linkUrl?: string | null;
}
