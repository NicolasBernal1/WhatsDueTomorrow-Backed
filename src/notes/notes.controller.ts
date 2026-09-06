import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { CreateNoteDto } from './dtos/create-note.dto';
import { NoteResponseDto } from './dtos/note-response.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { NotesService } from './notes.service';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email?: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('subjects/:subjectId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAll(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ): Promise<BaseResponseDto<NoteResponseDto[]>> {
    return this.notesService.getBySubject(req.user.sub, subjectId);
  }

  @Get(':noteId')
  getById(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    return this.notesService.getById(req.user.sub, subjectId, noteId);
  }

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body() dto: CreateNoteDto,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    return this.notesService.create(req.user.sub, subjectId, dto);
  }

  @Patch(':noteId')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: UpdateNoteDto,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    return this.notesService.update(req.user.sub, subjectId, noteId, dto);
  }

  @Delete(':noteId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<BaseResponseDto<null>> {
    return this.notesService.remove(req.user.sub, subjectId, noteId);
  }
}
