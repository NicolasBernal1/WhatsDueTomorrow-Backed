/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';

describe('EvaluationsController', () => {
  let controller: EvaluationsController;
  let service: jest.Mocked<EvaluationsService>;

  beforeEach(async () => {
    service = {
      getBySubject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      simulate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [{ provide: EvaluationsService, useValue: service }],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
  });

  it('getBySubject calls service.getBySubject', async () => {
    const req = { user: { sub: 1 } };
    service.getBySubject.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.getBySubject(req, 10);
    expect(service.getBySubject).toHaveBeenCalledWith(1, 10);
    expect(res.status).toBe(200);
  });

  it('create calls service.create', async () => {
    const req = { user: { sub: 1 } };
    const dto = { name: 'Parcial', weight: 30, score: 4.0 };
    service.create.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.create(req, 10, dto);
    expect(service.create).toHaveBeenCalledWith(1, 10, dto);
    expect(res.status).toBe(200);
  });

  it('update calls service.update', async () => {
    const req = { user: { sub: 1 } };
    const dto = { name: 'Parcial Editado' };
    service.update.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.update(req, 10, 5, dto);
    expect(service.update).toHaveBeenCalledWith(1, 10, 5, dto);
    expect(res.status).toBe(200);
  });

  it('remove calls service.remove', async () => {
    const req = { user: { sub: 1 } };
    service.remove.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.remove(req, 10, 5);
    expect(service.remove).toHaveBeenCalledWith(1, 10, 5);
    expect(res.status).toBe(200);
  });

  it('simulate calls service.simulate', async () => {
    const req = { user: { sub: 1 } };
    const dto = { targetGrade: 4.0, hypotheticalScore: 4.5 };
    service.simulate.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {} as any,
    });

    const res = await controller.simulate(req, 10, dto);
    expect(service.simulate).toHaveBeenCalledWith(1, 10, dto);
    expect(res.status).toBe(200);
  });
});
