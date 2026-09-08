import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dtos/create-note.dto';
import { NoteResponseDto } from './dtos/note-response.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getBySubject(
    userId: number,
    subjectId: number,
  ): Promise<BaseResponseDto<NoteResponseDto[]>> {
    const subject = await this.getOwnedSubject(userId, subjectId);
    const notes = await this.noteRepository.find({
      where: { subject: { id: subjectId } },
      order: { createdAt: 'DESC' },
    });

    return {
      status: 200,
      message: 'Notes retrieved successfully',
      data: notes.map((note) => this.toResponseDto(note, subject.id)),
    };
  }

  async getById(
    userId: number,
    subjectId: number,
    noteId: number,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    const note = await this.getOwnedNote(userId, subjectId, noteId);
    return {
      status: 200,
      message: 'Note retrieved successfully',
      data: this.toResponseDto(note, subjectId),
    };
  }

  async create(
    userId: number,
    subjectId: number,
    dto: CreateNoteDto,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    const subject = await this.getOwnedSubject(userId, subjectId);

    const title = dto.title ? dto.title.trim() : '';
    if (!title) {
      throw new BadRequestException('The note title cannot be empty');
    }

    const content = dto.content ? dto.content.trim() : '';
    if (!content) {
      throw new BadRequestException('The note content cannot be empty');
    }

    const sanitizedUrl = this.validateAndSanitizeUrl(dto.linkUrl);

    const note = this.noteRepository.create({
      title,
      content,
      linkUrl: sanitizedUrl,
      subject,
    });

    const saved = await this.noteRepository.save(note);
    return {
      status: 201,
      message: 'Note created successfully',
      data: this.toResponseDto(saved, subject.id),
    };
  }

  async update(
    userId: number,
    subjectId: number,
    noteId: number,
    dto: UpdateNoteDto,
  ): Promise<BaseResponseDto<NoteResponseDto>> {
    const note = await this.getOwnedNote(userId, subjectId, noteId);

    if (dto.title !== undefined) {
      const trimmedTitle = dto.title.trim();
      if (!trimmedTitle) {
        throw new BadRequestException('The note title cannot be empty');
      }
      note.title = trimmedTitle;
    }

    if (dto.content !== undefined) {
      const trimmedContent = dto.content.trim();
      if (!trimmedContent) {
        throw new BadRequestException('The note content cannot be empty');
      }
      note.content = trimmedContent;
    }

    if (dto.linkUrl !== undefined) {
      note.linkUrl = this.validateAndSanitizeUrl(dto.linkUrl);
    }

    const updated = await this.noteRepository.save(note);
    return {
      status: 200,
      message: 'Note updated successfully',
      data: this.toResponseDto(updated, subjectId),
    };
  }

  async remove(
    userId: number,
    subjectId: number,
    noteId: number,
  ): Promise<BaseResponseDto<null>> {
    const note = await this.getOwnedNote(userId, subjectId, noteId);
    await this.noteRepository.remove(note);
    return {
      status: 200,
      message: 'Note deleted successfully',
      data: null,
    };
  }

  private async getOwnedSubject(
    userId: number,
    subjectId: number,
  ): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: { user: true },
    });
    if (!subject) {
      throw new NotFoundException('The subject does not exist');
    }
    if (subject.user?.id !== userId) {
      throw new ForbiddenException('You cannot access this subject');
    }
    return subject;
  }

  private async getOwnedNote(
    userId: number,
    subjectId: number,
    noteId: number,
  ): Promise<Note> {
    await this.getOwnedSubject(userId, subjectId);
    const note = await this.noteRepository.findOne({
      where: { id: noteId, subject: { id: subjectId } },
      relations: { subject: true },
    });
    if (!note) {
      throw new NotFoundException('The note does not exist');
    }
    return note;
  }

  private validateAndSanitizeUrl(url?: string | null): string | null {
    if (!url || !url.trim()) {
      return null;
    }
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new BadRequestException(
          'The link URL must use http or https protocol',
        );
      }
      return parsed.toString();
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new BadRequestException('The link URL format is invalid');
    }
  }

  private toResponseDto(note: Note, subjectId: number): NoteResponseDto {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      linkUrl: note.linkUrl ?? null,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      subjectId,
    };
  }
}
