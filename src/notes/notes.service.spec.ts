/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';

const studentId = 1;
const otherStudentId = 999;
const subjectId = 10;
const ownedSubject = {
  id: subjectId,
  name: 'Matemáticas',
  user: { id: studentId },
} as Subject;
const foreignSubject = {
  id: subjectId,
  name: 'Matemáticas',
  user: { id: otherStudentId },
} as Subject;

describe('NotesService (F24 - Bitácora de apuntes y recursos)', () => {
  let service: NotesService;
  let noteRepository: jest.Mocked<Repository<Note>>;
  let subjectRepository: jest.Mocked<Repository<Subject>>;

  beforeEach(async () => {
    noteRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;

    subjectRepository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: getRepositoryToken(Note), useValue: noteRepository },
        { provide: getRepositoryToken(Subject), useValue: subjectRepository },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  describe('getBySubject', () => {
    it('debe listar las notas ordenadas cronológicamente por fecha de creación descendente (RF24)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const mockNotes: Note[] = [
        {
          id: 2,
          title: 'Segunda Nota',
          content: 'Fórmula de integración por partes',
          linkUrl: 'https://campus.edu/recurso2',
          createdAt: new Date('2026-03-02T10:00:00Z'),
          updatedAt: new Date('2026-03-02T10:00:00Z'),
          subject: ownedSubject,
        },
        {
          id: 1,
          title: 'Primera Nota',
          content: 'Acuerdos de clase y ponderaciones',
          linkUrl: null,
          createdAt: new Date('2026-03-01T10:00:00Z'),
          updatedAt: new Date('2026-03-01T10:00:00Z'),
          subject: ownedSubject,
        },
      ];
      noteRepository.find.mockResolvedValue(mockNotes);

      const result = await service.getBySubject(studentId, subjectId);

      expect(subjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: subjectId },
        relations: { user: true },
      });
      expect(noteRepository.find).toHaveBeenCalledWith({
        where: { subject: { id: subjectId } },
        order: { createdAt: 'DESC' },
      });
      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe(2);
      expect(result.data[1].id).toBe(1);
    });

    it('debe retornar lista vacía si la asignatura no tiene apuntes registrados (HU24 CA3)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.find.mockResolvedValue([]);

      const result = await service.getBySubject(studentId, subjectId);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it('debe lanzar NotFoundException si la asignatura no existe', async () => {
      subjectRepository.findOne.mockResolvedValue(null);

      await expect(service.getBySubject(studentId, 404)).rejects.toThrow(
        NotFoundException,
      );
      expect(noteRepository.find).not.toHaveBeenCalled();
    });

    it('debe rechazar el acceso si la asignatura pertenece a otro estudiante (aislamiento de datos RF24)', async () => {
      subjectRepository.findOne.mockResolvedValue(foreignSubject);

      await expect(service.getBySubject(studentId, subjectId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(noteRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('debe retornar la nota consultada si pertenece a la asignatura del usuario', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const mockNote: Note = {
        id: 5,
        title: 'Fórmula de Euler',
        content: 'e^(i*pi) + 1 = 0',
        linkUrl: 'https://es.wikipedia.org/wiki/Identidad_de_Euler',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(mockNote);

      const result = await service.getById(studentId, subjectId, 5);

      expect(result.status).toBe(200);
      expect(result.data.id).toBe(5);
      expect(result.data.title).toBe('Fórmula de Euler');
    });

    it('debe lanzar NotFoundException si la nota no existe dentro de la asignatura', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.findOne.mockResolvedValue(null);

      await expect(service.getById(studentId, subjectId, 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe registrar una nueva nota con título, contenido y enlace opcional (HU24 CA1, RF24)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: 'Clase 01 - Introducción',
        content: 'Revisión del sílabo y enlace al repositorio oficial',
        linkUrl: 'https://github.com/materia/repo',
      };
      const createdNote: Note = {
        id: 101,
        title: dto.title,
        content: dto.content,
        linkUrl: 'https://github.com/materia/repo',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.create.mockReturnValue(createdNote);
      noteRepository.save.mockResolvedValue(createdNote);

      const result = await service.create(studentId, subjectId, dto);

      expect(noteRepository.create).toHaveBeenCalledWith({
        title: dto.title,
        content: dto.content,
        linkUrl: 'https://github.com/materia/repo',
        subject: ownedSubject,
      });
      expect(noteRepository.save).toHaveBeenCalledWith(createdNote);
      expect(result.status).toBe(201);
      expect(result.data.id).toBe(101);
      expect(result.data.title).toBe(dto.title);
    });

    it('debe permitir registrar nota sin enlace (linkUrl opcional)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: 'Apunte sin URL',
        content: 'Fórmula básica x = (-b +- sqrt(b^2-4ac))/(2a)',
      };
      const createdNote: Note = {
        id: 102,
        title: dto.title,
        content: dto.content,
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.create.mockReturnValue(createdNote);
      noteRepository.save.mockResolvedValue(createdNote);

      const result = await service.create(studentId, subjectId, dto);

      expect(result.status).toBe(201);
      expect(result.data.linkUrl).toBeNull();
    });

    it('debe rechazar nota con título vacío', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: '   ',
        content: 'Algún contenido',
      };

      await expect(service.create(studentId, subjectId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(noteRepository.save).not.toHaveBeenCalled();
    });

    it('debe rechazar nota con contenido vacío', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: 'Título válido',
        content: '   ',
      };

      await expect(service.create(studentId, subjectId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(noteRepository.save).not.toHaveBeenCalled();
    });

    it('debe validar formato de URL y rechazar URLs con esquemas maliciosos o inválidos (RNF08 XSS)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dtoMalicioso: CreateNoteDto = {
        title: 'Ataque XSS',
        content: 'Intento de injection',
        linkUrl: 'javascript:alert(1)',
      };

      await expect(
        service.create(studentId, subjectId, dtoMalicioso),
      ).rejects.toThrow(BadRequestException);
      expect(noteRepository.save).not.toHaveBeenCalled();
    });

    it('debe rechazar URL con formato completamente inválido (RNF08)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dtoInvalido: CreateNoteDto = {
        title: 'URL rota',
        content: 'Texto descriptivo',
        linkUrl: 'esto-no-es-una-url',
      };

      await expect(
        service.create(studentId, subjectId, dtoInvalido),
      ).rejects.toThrow(BadRequestException);
      expect(noteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe actualizar los campos de una nota existente previa validación de propiedad (HU24 CA2)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título viejo',
        content: 'Contenido viejo',
        linkUrl: 'https://old.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.save.mockImplementation(async (n: any) => n);

      const updateDto: UpdateNoteDto = {
        title: 'Título nuevo',
        content: 'Contenido actualizado',
        linkUrl: 'https://updated.com/resource',
      };

      const result = await service.update(studentId, subjectId, 7, updateDto);

      expect(result.status).toBe(200);
      expect(result.data.title).toBe('Título nuevo');
      expect(result.data.content).toBe('Contenido actualizado');
      expect(result.data.linkUrl).toBe('https://updated.com/resource');
    });

    it('debe permitir remover el enlace asignando null o cadena vacía', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título',
        content: 'Contenido',
        linkUrl: 'https://old.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.save.mockImplementation(async (n: any) => n);

      const result = await service.update(studentId, subjectId, 7, {
        linkUrl: '',
      });

      expect(result.data.linkUrl).toBeNull();
    });

    it('debe rechazar actualización si el nuevo título o contenido están vacíos', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título',
        content: 'Contenido',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);

      await expect(
        service.update(studentId, subjectId, 7, { title: '   ' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(studentId, subjectId, 7, { content: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar actualización con URL inválida', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título',
        content: 'Contenido',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);

      await expect(
        service.update(studentId, subjectId, 7, { linkUrl: 'ftp://invalido' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la nota existente previa validación de propiedad (HU24 CA2)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 8,
        title: 'Nota a borrar',
        content: 'Contenido temporal',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.remove.mockResolvedValue(existingNote);

      const result = await service.remove(studentId, subjectId, 8);

      expect(noteRepository.remove).toHaveBeenCalledWith(existingNote);
      expect(result.status).toBe(200);
      expect(result.message).toBe('Note deleted successfully');
    });

    it('debe rechazar eliminación si la nota no existe', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(studentId, subjectId, 99)).rejects.toThrow(
        NotFoundException,
      );
      expect(noteRepository.remove).not.toHaveBeenCalled();
    });

    it('debe rechazar eliminación si la materia pertenece a otro usuario', async () => {
      subjectRepository.findOne.mockResolvedValue(foreignSubject);

      await expect(service.remove(studentId, subjectId, 8)).rejects.toThrow(
        ForbiddenException,
      );
      expect(noteRepository.remove).not.toHaveBeenCalled();
    });
  });
});
