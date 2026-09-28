import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { EditSubjectDto } from './dtos/edit-subject.dto';
import { Should } from 'src/common/fluent-assertions';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: {
    getSubjects: jest.Mock;
    getSubject: jest.Mock;
    addSubject: jest.Mock;
    editSubject: jest.Mock;
    remove: jest.Mock;
    getAcademicLoadSummary: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getSubjects: jest.fn(),
      getSubject: jest.fn(),
      addSubject: jest.fn(),
      editSubject: jest.fn(),
      remove: jest.fn(),
      getAcademicLoadSummary: jest.fn(),
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
    Should(controller).NotBeNull();
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

      Should(service.getSubjects).HaveBeenCalledWith(1);
      result.Should().BeEquivalentTo(expected);
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

      Should(service.getSubject).HaveBeenCalledWith(1);
      result.Should().BeEquivalentTo(expected);
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

      Should(service.addSubject).HaveBeenCalledWith(1, dto);
      result.Should().BeEquivalentTo(expected);
    });
  });

  // F10 - PATCH /subjects/:id
  describe('editSubject (F10)', () => {
    it('deberia delegar en subjectService.editSubject(id, dto)', async () => {
      const dto: EditSubjectDto = { name: 'Physics' };
      const expected = { status: 200, message: 'Subject updated successfully' };
      service.editSubject.mockResolvedValue(expected);

      const result = await controller.editSubject(1, dto);

      Should(service.editSubject).HaveBeenCalledWith(1, dto);
      result.Should().BeEquivalentTo(expected);
    });
  });

  // F11 - DELETE /subjects/:id
  describe('removeSubject (F11)', () => {
    it('deberia delegar en subjectService.remove(id)', async () => {
      const expected = { status: 200, message: 'Subject deleted successfully' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.removeSubject(1);

      Should(service.remove).HaveBeenCalledWith(1);
      result.Should().BeEquivalentTo(expected);
    });
  });

  // F26 - GET /subjects/academic-load
  describe('getAcademicLoadSummary (F26 — Camino P3/P4/P5)', () => {
    it('debe delegar en subjectService.getAcademicLoadSummary(userId)', async () => {
      const expected = {
        status: 200,
        message: 'Academic load summary calculated successfully',
        data: {
          totalCredits: 15,
          status: 'balanceada' as const,
          statusLabel: 'Carga balanceada',
          weeklyPresentialHours: 6,
          weeklyAutonomousHours: 12,
          subjectsCount: 4,
          classesCount: 3,
        },
      };
      service.getAcademicLoadSummary.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.getAcademicLoadSummary(req);

      Should(service.getAcademicLoadSummary).HaveBeenCalledWith(1);
      result.Should().BeEquivalentTo(expected);
    });
  });
});