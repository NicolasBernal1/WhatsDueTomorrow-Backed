import { Test, TestingModule } from '@nestjs/testing';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';

describe('SubtasksController (F22 — Controlador de Subtareas)', () => {
  let controller: SubtasksController;
  let service: jest.Mocked<SubtasksService>;

  beforeEach(async () => {
    const subtasksServiceMock = {
      getByAssignment: jest.fn(),
      create: jest.fn(),
      reorder: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubtasksController],
      providers: [{ provide: SubtasksService, useValue: subtasksServiceMock }],
    }).compile();

    controller = module.get<SubtasksController>(SubtasksController);
    service = module.get(SubtasksService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  // Camino P1: 1-2-3-21 (Verificación de guardias de seguridad JWT)
  describe('Camino P1 (1-2-3-21): Verificación de guardias de seguridad JWT', () => {
    it('debe proteger todas las rutas del controlador con AuthGuard("jwt")', () => {
      const guards = Reflect.getMetadata('__guards__', SubtasksController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });

  it('getAll: debe delegar en subtasksService.getByAssignment con req.user.sub y assignmentId', async () => {
    const req = { user: { sub: 1 } };
    const expected = { status: 200, message: 'OK', data: { subtasks: [], progress: 0 } };
    service.getByAssignment.mockResolvedValue(expected as any);

    const result = await controller.getAll(req, 10);

    expect(service.getByAssignment).toHaveBeenCalledWith(1, 10);
    expect(result).toBe(expected);
  });

  it('create: debe delegar en subtasksService.create con dto de subtarea', async () => {
    const req = { user: { sub: 1 } };
    const dto = { title: 'Paso 1' };
    const expected = { status: 200, message: 'OK', data: { subtasks: [], progress: 0 } };
    service.create.mockResolvedValue(expected as any);

    const result = await controller.create(req, 10, dto);

    expect(service.create).toHaveBeenCalledWith(1, 10, dto);
    expect(result).toBe(expected);
  });

  it('reorder: debe delegar en subtasksService.reorder con orden posicional', async () => {
    const req = { user: { sub: 1 } };
    const dto = { orderedIds: [2, 1] };
    const expected = { status: 200, message: 'OK', data: { subtasks: [], progress: 0 } };
    service.reorder.mockResolvedValue(expected as any);

    const result = await controller.reorder(req, 10, dto);

    expect(service.reorder).toHaveBeenCalledWith(1, 10, dto);
    expect(result).toBe(expected);
  });

  it('update: debe delegar en subtasksService.update con subtaskId y cambios', async () => {
    const req = { user: { sub: 1 } };
    const dto = { completed: true };
    const expected = { status: 200, message: 'OK', data: { subtasks: [], progress: 100 } };
    service.update.mockResolvedValue(expected as any);

    const result = await controller.update(req, 10, 101, dto);

    expect(service.update).toHaveBeenCalledWith(1, 10, 101, dto);
    expect(result).toBe(expected);
  });

  it('remove: debe delegar en subtasksService.remove con subtaskId', async () => {
    const req = { user: { sub: 1 } };
    const expected = { status: 200, message: 'OK', data: { subtasks: [], progress: 0 } };
    service.remove.mockResolvedValue(expected as any);

    const result = await controller.remove(req, 10, 101);

    expect(service.remove).toHaveBeenCalledWith(1, 10, 101);
    expect(result).toBe(expected);
  });
});
