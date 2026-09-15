import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController (F24 — Controlador de Bitácora de Apuntes - Tabla 26)', () => {
  let controller: NotesController;
  let service: jest.Mocked<NotesService>;

  beforeEach(async () => {
    service = {
      getBySubject: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: service }],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('debe estar definido el controlador NotesController', () => {
    expect(controller).toBeDefined();
  });

  // Camino P1: 1-2-3-20
  describe('Camino P1 (1-2-3-20): Verificación de guardias de seguridad JWT', () => {
    it('debe proteger todas las rutas del controlador con AuthGuard("jwt")', () => {
      const guards = Reflect.getMetadata('__guards__', NotesController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });

  // Camino P4: 1-2-4-5-7-9-10-20
  describe('Camino P4 (1-2-4-5-7-9-10-20): GET /subjects/:subjectId/notes', () => {
    it('debe delegar en notesService.getBySubject con req.user.sub y subjectId', async () => {
      const req = { user: { sub: 1 } };
      const expected = {
        status: 200,
        message: 'Notes retrieved successfully',
        data: [],
      };
      service.getBySubject.mockResolvedValue(expected as any);

      const result = await controller.getAll(req, 10);

      expect(service.getBySubject).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(expected);
    });
  });

  // Camino P6: 1-2-4-5-7-9-11-20
  describe('Camino P6 (1-2-4-5-7-9-11-20): GET /subjects/:subjectId/notes/:noteId', () => {
    it('debe delegar en notesService.getById con req.user.sub, subjectId y noteId', async () => {
      const req = { user: { sub: 1 } };
      const expected = {
        status: 200,
        message: 'Note retrieved successfully',
        data: { id: 5, title: 'Nota' } as any,
      };
      service.getById.mockResolvedValue(expected as any);

      const result = await controller.getById(req, 10, 5);

      expect(service.getById).toHaveBeenCalledWith(1, 10, 5);
      expect(result).toBe(expected);
    });
  });

  // Camino P9: 1-2-4-5-7-9-13-15-20
  describe('Camino P9 (1-2-4-5-7-9-13-15-20): POST /subjects/:subjectId/notes', () => {
    it('debe delegar en notesService.create con dto de nuevo apunte', async () => {
      const req = { user: { sub: 1 } };
      const dto = {
        title: 'Nueva Nota',
        content: 'Contenido relevante',
        linkUrl: 'https://recurso.edu',
      };
      const expected = {
        status: 201,
        message: 'Note created successfully',
        data: { id: 101, ...dto } as any,
      };
      service.create.mockResolvedValue(expected as any);

      const result = await controller.create(req, 10, dto);

      expect(service.create).toHaveBeenCalledWith(1, 10, dto);
      expect(result).toBe(expected);
    });
  });

  // Camino P12: 1-2-4-5-7-9-16-17-20
  describe('Camino P12 (1-2-4-5-7-9-16-17-20): PATCH /subjects/:subjectId/notes/:noteId', () => {
    it('debe delegar en notesService.update con dto de actualización', async () => {
      const req = { user: { sub: 1 } };
      const dto = { title: 'Título actualizado' };
      const expected = {
        status: 200,
        message: 'Note updated successfully',
        data: { id: 5, title: 'Título actualizado' } as any,
      };
      service.update.mockResolvedValue(expected as any);

      const result = await controller.update(req, 10, 5, dto);

      expect(service.update).toHaveBeenCalledWith(1, 10, 5, dto);
      expect(result).toBe(expected);
    });
  });

  // Camino P14: 1-2-4-5-7-9-18-19-20
  describe('Camino P14 (1-2-4-5-7-9-18-19-20): DELETE /subjects/:subjectId/notes/:noteId', () => {
    it('debe delegar en notesService.remove con subjectId y noteId', async () => {
      const req = { user: { sub: 1 } };
      const expected = {
        status: 200,
        message: 'Note deleted successfully',
        data: null,
      };
      service.remove.mockResolvedValue(expected as any);

      const result = await controller.remove(req, 10, 5);

      expect(service.remove).toHaveBeenCalledWith(1, 10, 5);
      expect(result).toBe(expected);
    });
  });
});
