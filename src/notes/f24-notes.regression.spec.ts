import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
import { Should } from '../common/fluent-assertions';

/**
 * ============================================================================
 * SUITE DE PRUEBAS DE REGRESIÓN — F24: BITÁCORA DE APUNTES Y RECURSOS RÁPIDOS
 * ============================================================================
 * Objetivo de Regresión:
 * Garantizar que modificaciones futuras en las entidades, lógica de negocio,
 * sanitización de enlaces externos, ordenamiento cronológico o controles
 * de acceso multiusuario (anti-IDOR) no degraden ni introduzcan fallos de
 * seguridad o inconsistencias en la bitácora de apuntes de cada asignatura.
 */
describe('F24 Regression Suite: Bitácora de apuntes y recursos rápidos por asignatura (Backend)', () => {
  let service: NotesService;

  const userOwner = { id: 10, name: 'Estudiante Autorizado' };
  const userAttacker = { id: 99, name: 'Usuario No Autorizado' };

  const subjectOwner = {
    id: 5,
    name: 'Ingeniería de Software II',
    user: userOwner,
  } as Subject;

  const mockNoteRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockSubjectRepo = {
    findOne: jest.fn(),
  };

  function createNoteEntity(overrides: Partial<Note> = {}): Note {
    return {
      id: 1,
      title: 'Apunte por defecto',
      content: 'Contenido del apunte',
      linkUrl: 'https://universidad.edu/recurso',
      createdAt: new Date('2026-05-10T10:00:00Z'),
      updatedAt: new Date('2026-05-10T10:00:00Z'),
      subject: subjectOwner,
      ...overrides,
    } as Note;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: getRepositoryToken(Note), useValue: mockNoteRepo },
        { provide: getRepositoryToken(Subject), useValue: mockSubjectRepo },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 1: Validación y Sanitización de URLs de Recursos Externos
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 1: Sanitización y Reglas de Protocolo para URLs (linkUrl)', () => {
    it('debe aceptar protocolos seguros http: y https:, devolviendo la URL normalizada', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      mockNoteRepo.create.mockImplementation((dto) => dto);
      mockNoteRepo.save.mockImplementation(async (note) => ({ ...note, id: 101 }));

      const res = await service.create(userOwner.id, subjectOwner.id, {
        title: 'Repositorio del Proyecto',
        content: 'Código fuente en GitHub',
        linkUrl: '   https://github.com/proyecto/repo   ',
      });

      res.status.Should().Be(201);
      Should(res.data?.linkUrl).Be('https://github.com/proyecto/repo');
    });

    it('debe convertir URLs vacías, nulas o con solo espacios a null sin arrojar excepción', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      mockNoteRepo.create.mockImplementation((dto) => dto);
      mockNoteRepo.save.mockImplementation(async (note) => ({ ...note, id: 102 }));

      const res1 = await service.create(userOwner.id, subjectOwner.id, {
        title: 'Apunte sin URL',
        content: 'Solo texto',
        linkUrl: '     ',
      });
      Should(res1.data?.linkUrl).BeNull();

      const res2 = await service.create(userOwner.id, subjectOwner.id, {
        title: 'Apunte con URL undefined',
        content: 'Texto descriptivo',
      });
      Should(res2.data?.linkUrl).BeNull();
    });

    it('debe rechazar con BadRequestException protocolos no seguros o maliciosos (javascript:, ftp:, file:)', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);

      // Vector de ataque XSS javascript:
      await Should(async () =>
        service.create(userOwner.id, subjectOwner.id, {
          title: 'Ataque XSS',
          content: 'Payload',
          linkUrl: 'javascript:alert(document.cookie)',
        }),
      ).ThrowAsync('The link URL must use http or https protocol');

      // Protocolo ftp:
      await Should(async () =>
        service.create(userOwner.id, subjectOwner.id, {
          title: 'Descarga FTP',
          content: 'Archivo remoto',
          linkUrl: 'ftp://ftp.servidor.com/archivo.zip',
        }),
      ).ThrowAsync(BadRequestException);

      Should(mockNoteRepo.save).NotHaveBeenCalled();
    });

    it('debe rechazar con BadRequestException cadenas con formato de URL no parseable', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);

      await Should(async () =>
        service.create(userOwner.id, subjectOwner.id, {
          title: 'Enlace Roto',
          content: 'Texto',
          linkUrl: 'esto no es una url valida',
        }),
      ).ThrowAsync('The link URL format is invalid');

      Should(mockNoteRepo.save).NotHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 2: Obligatoriedad y Sanitización de Título y Contenido (trim)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 2: Obligatoriedad y Sanitización con trim() en Textos', () => {
    it('debe rechazar la creación si el título o el contenido están vacíos o son solo espacios', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);

      // Título vacío
      await Should(async () =>
        service.create(userOwner.id, subjectOwner.id, {
          title: '   ',
          content: 'Contenido válido',
        }),
      ).ThrowAsync('The note title cannot be empty');

      // Contenido vacío
      await Should(async () =>
        service.create(userOwner.id, subjectOwner.id, {
          title: 'Título válido',
          content: '',
        }),
      ).ThrowAsync('The note content cannot be empty');

      Should(mockNoteRepo.save).NotHaveBeenCalled();
    });

    it('debe rechazar la actualización si se intenta vaciar el título o el contenido con espacios', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      const existingNote = createNoteEntity({ id: 201 });
      mockNoteRepo.findOne.mockResolvedValue(existingNote);

      await Should(async () =>
        service.update(userOwner.id, subjectOwner.id, 201, {
          title: '     ',
        }),
      ).ThrowAsync('The note title cannot be empty');

      await Should(async () =>
        service.update(userOwner.id, subjectOwner.id, 201, {
          content: '',
        }),
      ).ThrowAsync('The note content cannot be empty');

      Should(mockNoteRepo.save).NotHaveBeenCalled();
    });

    it('debe persistir título y contenido limpios de espacios en los extremos', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      mockNoteRepo.create.mockImplementation((dto) => dto);
      mockNoteRepo.save.mockImplementation(async (note) => ({ ...note, id: 202 }));

      await service.create(userOwner.id, subjectOwner.id, {
        title: '   Fórmulas de Complejidad Temporal   ',
        content: '   O(n log n) para MergeSort   ',
      });

      Should(mockNoteRepo.create).HaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fórmulas de Complejidad Temporal',
          content: 'O(n log n) para MergeSort',
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 3: Orden Cronológico Descendente (createdAt: 'DESC')
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 3: Orden Cronológico Descendente de la Bitácora', () => {
    it('debe consultar notas con order: { createdAt: "DESC" } y mapear subjectId', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      const notesList = [
        createNoteEntity({ id: 1, title: 'Nota Reciente', createdAt: new Date('2026-09-02') }),
        createNoteEntity({ id: 2, title: 'Nota Antigua', createdAt: new Date('2026-09-01') }),
      ];
      mockNoteRepo.find.mockResolvedValue(notesList);

      const result = await service.getBySubject(userOwner.id, subjectOwner.id);

      Should(mockNoteRepo.find).HaveBeenCalledWith({
        where: { subject: { id: subjectOwner.id } },
        order: { createdAt: 'DESC' },
      });

      result.status.Should().Be(200);
      result.data!.Should().HaveCount(2);
      result.data![0].title.Should().Be('Nota Reciente');
      result.data![0].subjectId.Should().Be(subjectOwner.id);
      result.data![1].title.Should().Be('Nota Antigua');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 4: Aislamiento Multiusuario y Rechazo IDOR
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 4: Aislamiento Multiusuario y Control de Acceso (Anti-IDOR)', () => {
    it('debe impedir que un usuario ajeno consulte, cree, edite o elimine notas de otra materia', async () => {
      // subjectOwner pertenece a userOwner (id: 10), pero la petición viene de userAttacker (id: 99)
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);

      // getBySubject
      await Should(async () =>
        service.getBySubject(userAttacker.id, subjectOwner.id),
      ).ThrowAsync('You cannot access this subject');

      // create
      await Should(async () =>
        service.create(userAttacker.id, subjectOwner.id, {
          title: 'Nota ilegítima',
          content: 'Texto',
        }),
      ).ThrowAsync(ForbiddenException);

      // update
      await Should(async () =>
        service.update(userAttacker.id, subjectOwner.id, 1, {
          title: 'Edición ilegítima',
        }),
      ).ThrowAsync(ForbiddenException);

      // remove
      await Should(async () =>
        service.remove(userAttacker.id, subjectOwner.id, 1),
      ).ThrowAsync(ForbiddenException);

      Should(mockNoteRepo.save).NotHaveBeenCalled();
      Should(mockNoteRepo.remove).NotHaveBeenCalled();
    });

    it('debe arrojar NotFoundException cuando la materia o la nota no existen', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(null);

      await Should(async () =>
        service.getBySubject(userOwner.id, 9999),
      ).ThrowAsync('The subject does not exist');

      // Materia existe pero nota no existe
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      mockNoteRepo.findOne.mockResolvedValue(null);

      await Should(async () =>
        service.getById(userOwner.id, subjectOwner.id, 8888),
      ).ThrowAsync('The note does not exist');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE 5: Eliminación Segura de Apuntes (remove)
  // ──────────────────────────────────────────────────────────────────────────
  describe('Invariante de Regresión 5: Eliminación de Apuntes (remove)', () => {
    it('debe eliminar la entidad mediante noteRepository.remove y responder con data: null', async () => {
      mockSubjectRepo.findOne.mockResolvedValue(subjectOwner);
      const noteToDelete = createNoteEntity({ id: 301 });
      mockNoteRepo.findOne.mockResolvedValue(noteToDelete);
      mockNoteRepo.remove.mockResolvedValue(noteToDelete);

      const result = await service.remove(userOwner.id, subjectOwner.id, 301);

      Should(mockNoteRepo.remove).HaveBeenCalledWith(noteToDelete);
      result.status.Should().Be(200);
      result.message.Should().Be('Note deleted successfully');
      Should(result.data).BeNull();
    });
  });
});
