import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { EditSubjectDto } from './dtos/edit-subject.dto';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: {
    getSubjects: jest.Mock;
    getSubject: jest.Mock;
    addSubject: jest.Mock;
    editSubject: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getSubjects: jest.fn(),
      getSubject: jest.fn(),
      addSubject: jest.fn(),
      editSubject: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: service }],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(controller).toBeDefined();
  });

  // F07 - GET /subjects
  describe('getSubjects (F07)', () => {
    it('deberia delegar en subjectService.getSubjects(userId)', async () => {
      const expected = {
        status: 200,
        message: 'Subjects retrieved successfully',
        data: [{ id: 1, name: 'Math', professor: 'John Doe', color: '#007bff' }],
      };
      service.getSubjects.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.getSubjects(req);

      expect(service.getSubjects).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // F08 - GET /subjects/:id
  describe('getSubjectById (F08)', () => {
    it('deberia delegar en subjectService.getSubject(id)', async () => {
      const expected = {
        status: 200,
        message: 'Subject rectrieved successfully',
        data: { id: 1, name: 'Math', professor: 'John Doe', color: '#007bff' },
      };
      service.getSubject.mockResolvedValue(expected);

      const result = await controller.getSubjectById(1);

      expect(service.getSubject).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // F09 - POST /subjects
  describe('addSubject (F09)', () => {
    it('deberia delegar en subjectService.addSubject(userId, dto)', async () => {
      const dto: AddSubjectDto = {
        name: 'Math',
        professor: 'John Doe',
        color: '#ff0000',
      } as AddSubjectDto;
      const expected = { status: 201, message: 'Subject created successfully' };
      service.addSubject.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.addSubject(req, dto);

      expect(service.addSubject).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  // F10 - PATCH /subjects/:id
  describe('editSubject (F10)', () => {
    it('deberia delegar en subjectService.editSubject(id, dto)', async () => {
      const dto: EditSubjectDto = { name: 'Physics' };
      const expected = { status: 200, message: 'Subject updated successfully' };
      service.editSubject.mockResolvedValue(expected);

      const result = await controller.editSubject(1, dto);

      expect(service.editSubject).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  // F11 - DELETE /subjects/:id
  describe('removeSubject (F11)', () => {
    it('deberia delegar en subjectService.remove(id)', async () => {
      const expected = { status: 200, message: 'Subject deleted successfully' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.removeSubject(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });
});