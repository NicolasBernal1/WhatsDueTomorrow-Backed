import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Subtask } from './entities/subtask.entity';
import { SubtasksService } from './subtasks.service';

const assignment = { id: 10, user: { id: 1 } } as Assignment;
const repository = {
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
};
const assignmentsRepository = { findOne: jest.fn() };

describe('SubtasksService', () => {
  let service: SubtasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        { provide: getRepositoryToken(Subtask), useValue: repository },
        {
          provide: getRepositoryToken(Assignment),
          useValue: assignmentsRepository,
        },
      ],
    }).compile();
    service = module.get(SubtasksService);
    jest.clearAllMocks();
  });

  it('calculates progress from completed subtasks', async () => {
    assignmentsRepository.findOne.mockResolvedValue(assignment);
    repository.find.mockResolvedValue([
      { id: 1, title: 'Paso 1', completed: true, position: 0 },
      { id: 2, title: 'Paso 2', completed: false, position: 1 },
      { id: 3, title: 'Paso 3', completed: true, position: 2 },
    ]);

    const result = await service.getByAssignment(1, 10);

    expect(result.data?.progress).toBe(67);
    expect(result.data?.subtasks).toHaveLength(3);
  });

  it('rejects access to another student assignment', async () => {
    assignmentsRepository.findOne.mockResolvedValue({
      id: 10,
      user: { id: 2 },
    });

    await expect(service.getByAssignment(1, 10)).rejects.toThrow(
      ForbiddenException,
    );
    expect(repository.find).not.toHaveBeenCalled();
  });
});
