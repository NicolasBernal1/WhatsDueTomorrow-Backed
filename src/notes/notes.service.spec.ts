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
import { Should } from '../common/fluent-assertions';

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

describe('NotesService (F24 — Caminos Básicos Backend Tabla 26)', () => {
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
  });

  it('debe estar definido el servicio NotesService', () => {
    service.Should().BeDefined();
  });

  // Camino P2: 1-2-4-5-6-20
  describe('Camino P2 (1-2-4-5-6-20): Asignatura no existe en PostgreSQL', () => {
    it('debe lanzar NotFoundException("The subject does not exist") al intentar consultar notas', async () => {
      subjectRepository.findOne.mockResolvedValue(null);

      (
        await Should(() => service.getBySubject(studentId, 404)).ThrowAsync(
          NotFoundException,
        )
      ).WithMessage('The subject does not exist');
      Should(noteRepository.find).NotHaveBeenCalled();
    });
  });

  // Camino P3: 1-2-4-5-7-8-20
  describe('Camino P3 (1-2-4-5-7-8-20): Control de acceso (materia de otro usuario)', () => {
    it('debe lanzar ForbiddenException("You cannot access this subject") si la asignatura no pertenece al usuario autenticado', async () => {
      subjectRepository.findOne.mockResolvedValue(foreignSubject);

      (
        await Should(() =>
          service.getBySubject(studentId, subjectId),
        ).ThrowAsync(ForbiddenException)
      ).WithMessage('You cannot access this subject');
      Should(noteRepository.find).NotHaveBeenCalled();
    });
  });

  // Camino P4: 1-2-4-5-7-9-10-20
  describe('Camino P4 (1-2-4-5-7-9-10-20): Listado cronológico de notas (GET /)', () => {
    it('debe retornar lista de notas ordenadas por createdAt DESC', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const mockNotes: Note[] = [
        {
          id: 2,
          title: 'Segunda Nota',
          content: 'Fórmula de integración',
          linkUrl: 'https://campus.edu/recurso2',
          createdAt: new Date('2026-03-02T10:00:00Z'),
          updatedAt: new Date('2026-03-02T10:00:00Z'),
          subject: ownedSubject,
        },
        {
          id: 1,
          title: 'Primera Nota',
          content: 'Acuerdos de clase',
          linkUrl: null,
          createdAt: new Date('2026-03-01T10:00:00Z'),
          updatedAt: new Date('2026-03-01T10:00:00Z'),
          subject: ownedSubject,
        },
      ];
      noteRepository.find.mockResolvedValue(mockNotes);

      const result = await service.getBySubject(studentId, subjectId);

      Should(subjectRepository.findOne).HaveBeenCalledWith({
        where: { id: subjectId },
        relations: { user: true },
      });
      Should(noteRepository.find).HaveBeenCalledWith({
        where: { subject: { id: subjectId } },
        order: { createdAt: 'DESC' },
      });
      result.status.Should().Be(200);
      result.data.Should().HaveCount(2);
      result.data[0].id.Should().Be(2);
      result.data[1].id.Should().Be(1);
    });

    it('debe retornar arreglo vacío cuando la asignatura no registra notas previas', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.find.mockResolvedValue([]);

      const result = await service.getBySubject(studentId, subjectId);

      result.status.Should().Be(200);
      result.data.Should().BeEquivalentTo([]);
    });
  });

  // Camino P5: 1-2-4-5-7-9-11-12-20
  describe('Camino P5 (1-2-4-5-7-9-11-12-20): Consulta individual con apunte inexistente', () => {
    it('debe lanzar NotFoundException("The note does not exist") si el noteId no pertenece a la materia', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.findOne.mockResolvedValue(null);

      (
        await Should(() =>
          service.getById(studentId, subjectId, 999),
        ).ThrowAsync(NotFoundException)
      ).WithMessage('The note does not exist');
    });
  });

  // Camino P6: 1-2-4-5-7-9-11-20
  describe('Camino P6 (1-2-4-5-7-9-11-20): Consulta individual de apunte exitosa', () => {
    it('debe retornar NoteResponseDto correspondiente al apunte consultado', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const mockNote: Note = {
        id: 5,
        title: 'Fórmula de Euler',
        content: 'e^(i*pi) + 1 = 0',
        linkUrl: 'https://campus.edu/euler',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(mockNote);

      const result = await service.getById(studentId, subjectId, 5);

      result.status.Should().Be(200);
      result.data.id.Should().Be(5);
      result.data.title.Should().Be('Fórmula de Euler');
      result.data.linkUrl.Should().Be('https://campus.edu/euler');
    });
  });

  // Camino P7: 1-2-4-5-7-9-13-14-20
  describe('Camino P7 (1-2-4-5-7-9-13-14-20): Creación con título o contenido vacíos', () => {
    it('debe rechazar la creación si title está vacío o solo contiene espacios', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = { title: '   ', content: 'Contenido válido' };

      (
        await Should(() =>
          service.create(studentId, subjectId, dto),
        ).ThrowAsync(BadRequestException)
      ).WithMessage('The note title cannot be empty');
      Should(noteRepository.save).NotHaveBeenCalled();
    });

    it('debe rechazar la creación si content está vacío o solo contiene espacios', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = { title: 'Título válido', content: '   ' };

      (
        await Should(() =>
          service.create(studentId, subjectId, dto),
        ).ThrowAsync(BadRequestException)
      ).WithMessage('The note content cannot be empty');
      Should(noteRepository.save).NotHaveBeenCalled();
    });
  });

  // Camino P8: 1-2-4-5-7-9-13-15-14-20
  describe('Camino P8 (1-2-4-5-7-9-13-15-14-20): Creación con linkUrl inválida o protocolo no permitido', () => {
    it('debe rechazar linkUrl con esquema que no sea http o https (ej. javascript o ftp)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = {
        title: 'Nota de alerta',
        content: 'Contenido',
        linkUrl: 'javascript:alert(1)',
      };

      (
        await Should(() =>
          service.create(studentId, subjectId, dto),
        ).ThrowAsync(BadRequestException)
      ).WithMessage('The link URL must use http or https protocol');
      Should(noteRepository.save).NotHaveBeenCalled();
    });

    it('debe rechazar linkUrl con formato completamente malformado', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = {
        title: 'Nota con link roto',
        content: 'Contenido',
        linkUrl: 'esto-no-es-una-url',
      };

      (
        await Should(() =>
          service.create(studentId, subjectId, dto),
        ).ThrowAsync(BadRequestException)
      ).WithMessage('The link URL format is invalid');
      Should(noteRepository.save).NotHaveBeenCalled();
    });
  });

  // Camino P9: 1-2-4-5-7-9-13-15-20
  describe('Camino P9 (1-2-4-5-7-9-13-15-20): Creación nominal de apunte con o sin enlace', () => {
    it('debe crear y persistir el apunte con enlace válido sanitizado (201 Created)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: '  Apunte de Laboratorio  ',
        content: '  Procedimiento de calibración  ',
        linkUrl: 'https://laboratorio.edu/guia.pdf',
      };
      const createdNote: Note = {
        id: 101,
        title: 'Apunte de Laboratorio',
        content: 'Procedimiento de calibración',
        linkUrl: 'https://laboratorio.edu/guia.pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.create.mockReturnValue(createdNote);
      noteRepository.save.mockResolvedValue(createdNote);

      const result = await service.create(studentId, subjectId, dto);

      Should(noteRepository.create).HaveBeenCalledWith({
        title: 'Apunte de Laboratorio',
        content: 'Procedimiento de calibración',
        linkUrl: 'https://laboratorio.edu/guia.pdf',
        subject: ownedSubject,
      });
      Should(noteRepository.save).HaveBeenCalledWith(createdNote);
      result.status.Should().Be(201);
      result.data.id.Should().Be(101);
      result.data.title.Should().Be('Apunte de Laboratorio');
    });

    it('debe permitir crear apunte sin enlace (linkUrl omitido o nulo)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto: CreateNoteDto = {
        title: 'Apunte teórico',
        content: 'Fórmulas puras',
      };
      const createdNote: Note = {
        id: 102,
        title: 'Apunte teórico',
        content: 'Fórmulas puras',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.create.mockReturnValue(createdNote);
      noteRepository.save.mockResolvedValue(createdNote);

      const result = await service.create(studentId, subjectId, dto);

      result.status.Should().Be(201);
      Should(result.data.linkUrl).BeNull();
    });
  });

  // Camino P10: 1-2-4-5-7-9-16-12-20
  describe('Camino P10 (1-2-4-5-7-9-16-12-20): Actualización con apunte inexistente', () => {
    it('debe lanzar NotFoundException("The note does not exist") al intentar actualizar apunte inexistente', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.findOne.mockResolvedValue(null);

      await Should(() =>
        service.update(studentId, subjectId, 999, { title: 'Nuevo' }),
      ).ThrowAsync(NotFoundException);
    });
  });

  // Camino P11: 1-2-4-5-7-9-16-17-14-20
  describe('Camino P11 (1-2-4-5-7-9-16-17-14-20): Actualización con campos vacíos o URL malformada', () => {
    it('debe rechazar actualización si el nuevo título o contenido están en blanco', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Viejo',
        content: 'Viejo',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);

      await Should(() =>
        service.update(studentId, subjectId, 7, { title: '   ' }),
      ).ThrowAsync(BadRequestException);
      await Should(() =>
        service.update(studentId, subjectId, 7, { content: '   ' }),
      ).ThrowAsync(BadRequestException);
    });
  });

  // Camino P12: 1-2-4-5-7-9-16-17-20
  describe('Camino P12 (1-2-4-5-7-9-16-17-20): Actualización nominal de apunte', () => {
    it('debe actualizar los campos válidos y remover el enlace asignando cadena vacía', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título anterior',
        content: 'Contenido anterior',
        linkUrl: 'https://viejo.edu',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.save.mockImplementation(async (n: any) => n);

      const updateDto: UpdateNoteDto = {
        title: 'Título modificado',
        content: 'Contenido modificado',
        linkUrl: '',
      };

      const result = await service.update(studentId, subjectId, 7, updateDto);

      result.status.Should().Be(200);
      result.data.title.Should().Be('Título modificado');
      result.data.content.Should().Be('Contenido modificado');
      Should(result.data.linkUrl).BeNull();
    });
  });

  // Camino P13: 1-2-4-5-7-9-18-12-20
  describe('Camino P13 (1-2-4-5-7-9-18-12-20): Eliminación con apunte inexistente', () => {
    it('debe lanzar NotFoundException("The note does not exist") si el apunte a borrar no existe', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      noteRepository.findOne.mockResolvedValue(null);

      await Should(() => service.remove(studentId, subjectId, 999)).ThrowAsync(
        NotFoundException,
      );
      Should(noteRepository.remove).NotHaveBeenCalled();
    });
  });

  // Camino P14: 1-2-4-5-7-9-18-19-20
  describe('Camino P14 (1-2-4-5-7-9-18-19-20): Eliminación nominal de apunte', () => {
    it('debe remover el apunte de la base de datos y retornar 200 con data null', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 8,
        title: 'Nota temporal',
        content: 'Borrador',
        linkUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.remove.mockResolvedValue(existingNote);

      const result = await service.remove(studentId, subjectId, 8);

      Should(noteRepository.remove).HaveBeenCalledWith(existingNote);
      result.status.Should().Be(200);
      result.message.Should().Be('Note deleted successfully');
      Should(result.data).BeNull();
    });
  });

  // =========================================================================
  // Verificación de Defectos de Calidad QA (Auditoría QA)
  // =========================================================================
  describe('Verificación de Defectos de Calidad QA (Auditoría QA)', () => {
    it('[DEF-QA-F24-01] debe documentar que el backend acepta enlaces con nombres de dominio incompletos o absurdos (ej. "http://a") por falta de validación FQDN', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dtoInvalidoSemantico: CreateNoteDto = {
        title: 'Nota con dominio absurdo',
        content: 'Referencia a recurso ficticio',
        linkUrl: 'http://a',
      };
      const mockSaved = {
        id: 103,
        ...dtoInvalidoSemantico,
        linkUrl: 'http://a/',
        subject: ownedSubject,
      } as any;
      noteRepository.create.mockReturnValue(mockSaved);
      noteRepository.save.mockResolvedValue(mockSaved);

      // Verificación del defecto QA DEF-QA-F24-01:
      // Se documenta y verifica que validateAndSanitizeUrl acepta "http://a" sin exigir FQDN,
      // resolviendo exitosamente con código 201 en lugar de lanzar BadRequestException.
      const result = await service.create(
        studentId,
        subjectId,
        dtoInvalidoSemantico,
      );
      result.status.Should().Be(201);
      result.data.linkUrl.Should().Be('http://a/');
    });
  });

  describe('Ramas de asignación por defecto no cubiertas por los Caminos Básicos', () => {
    it('debe rechazar nota sin título (campo ausente, no solo vacío)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = { content: 'Algún contenido' } as CreateNoteDto;

      await Should(() => service.create(studentId, subjectId, dto)).ThrowAsync(
        BadRequestException,
      );
      Should(noteRepository.save).NotHaveBeenCalled();
    });

    it('debe rechazar nota sin contenido (campo ausente, no solo vacío)', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const dto = { title: 'Título válido' } as CreateNoteDto;

      await Should(() => service.create(studentId, subjectId, dto)).ThrowAsync(
        BadRequestException,
      );
      Should(noteRepository.save).NotHaveBeenCalled();
    });

    it('debe actualizar solo el título sin tocar el enlace existente', async () => {
      subjectRepository.findOne.mockResolvedValue(ownedSubject);
      const existingNote: Note = {
        id: 7,
        title: 'Título viejo',
        content: 'Contenido',
        linkUrl: 'https://old.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        subject: ownedSubject,
      };
      noteRepository.findOne.mockResolvedValue(existingNote);
      noteRepository.save.mockImplementation(async (n: any) => n);

      const result = await service.update(studentId, subjectId, 7, {
        title: 'Título nuevo',
      });

      result.data.title.Should().Be('Título nuevo');
      result.data.linkUrl.Should().Be('https://old.com');
    });
  });
});
