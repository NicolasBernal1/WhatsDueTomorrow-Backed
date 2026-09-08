/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
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

  it('getAll calls service.getBySubject with userId and subjectId', async () => {
    const req = { user: { sub: 1 } };
    service.getBySubject.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: [],
    });

    const res = await controller.getAll(req, 10);
    expect(service.getBySubject).toHaveBeenCalledWith(1, 10);
    expect(res.status).toBe(200);
  });

  it('getById calls service.getById with userId, subjectId, and noteId', async () => {
    const req = { user: { sub: 1 } };
    service.getById.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.getById(req, 10, 5);
    expect(service.getById).toHaveBeenCalledWith(1, 10, 5);
    expect(res.status).toBe(200);
  });

  it('create calls service.create with userId, subjectId, and dto', async () => {
    const req = { user: { sub: 1 } };
    const dto = {
      title: 'Nota',
      content: 'Contenido',
      linkUrl: 'https://test.com',
    };
    service.create.mockResolvedValue({
      status: 201,
      message: 'created',
      data: {} as any,
    });

    const res = await controller.create(req, 10, dto);
    expect(service.create).toHaveBeenCalledWith(1, 10, dto);
    expect(res.status).toBe(201);
  });

  it('update calls service.update with userId, subjectId, noteId, and dto', async () => {
    const req = { user: { sub: 1 } };
    const dto = { title: 'Nuevo título' };
    service.update.mockResolvedValue({
      status: 200,
      message: 'updated',
      data: {} as any,
    });

    const res = await controller.update(req, 10, 5, dto);
    expect(service.update).toHaveBeenCalledWith(1, 10, 5, dto);
    expect(res.status).toBe(200);
  });

  it('remove calls service.remove with userId, subjectId, and noteId', async () => {
    const req = { user: { sub: 1 } };
    service.remove.mockResolvedValue({
      status: 200,
      message: 'deleted',
      data: null,
    });

    const res = await controller.remove(req, 10, 5);
    expect(service.remove).toHaveBeenCalledWith(1, 10, 5);
    expect(res.status).toBe(200);
  });
});
