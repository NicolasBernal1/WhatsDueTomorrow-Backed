import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { AddSubjectDto } from './dtos/add-subject.dto';
import { EditSubjectDto } from './dtos/edit-subject.dto';
import { AddClassDto } from './dtos/add-class.dto';
import { EditClassDto } from './dtos/edit-class.dto';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: {
    getSubjects: jest.Mock;
    getClassesByid: jest.Mock;
    getSubject: jest.Mock;
    addSubject: jest.Mock;
    editSubject: jest.Mock;
    remove: jest.Mock;
    addClass: jest.Mock;
    removeClass: jest.Mock;
    editClass: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getSubjects: jest.fn(),
      getClassesByid: jest.fn(),
      getSubject: jest.fn(),
      addSubject: jest.fn(),
      editSubject: jest.fn(),
      remove: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn(),
      editClass: jest.fn(),
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

  // GET /subjects (listar asignaturas del usuario autenticado)
  describe('getSubjects', () => {
    it('deberia delegar en subjectService.getSubjects(userId)', async () => {
      const expected = {
        status: 200,
        message: 'Subjects retrieved successfully',
        data: [{ id: 1, name: 'validacion', professor: 'gabriel', color: '#007bff' }],
      };
      service.getSubjects.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.getSubjects(req);

      expect(service.getSubjects).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // GET /subjects/classes (ver horario: clases del usuario autenticado)
  describe('getUserClasses', () => {
    it('deberia delegar en subjectService.getClassesByid(userId)', async () => {
      const expected = {
        status: 200,
        message: 'Classes retrieved successfully',
        data: [
          {
            id: 5,
            dayOfWeek: 'monday',
            startTime: '08:00',
            endTime: '10:00',
            subject: { id: 1, name: 'validacion', professor: 'gabriel', color: '#007bff' },
          },
        ],
      };
      service.getClassesByid.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.getUserClasses(req);

      expect(service.getClassesByid).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // GET /subjects/:id
  describe('getSubjectById', () => {
    it('deberia delegar en subjectService.getSubject(id)', async () => {
      const expected = {
        status: 200,
        message: 'Subject rectrieved successfully',
        data: { id: 1, name: 'validacion', professor: 'gabriel', color: '#007bff' },
      };
      service.getSubject.mockResolvedValue(expected);

      const result = await controller.getSubjectById(1);

      expect(service.getSubject).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // POST /subjects
  describe('addSubject', () => {
    it('deberia delegar en subjectService.addSubject(userId, dto)', async () => {
      const dto: AddSubjectDto = {
        name: 'validacion',
        professor: 'gabriel',
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

  // PATCH /subjects/:id
  describe('editSubject', () => {
    it('deberia delegar en subjectService.editSubject(id, dto)', async () => {
      const dto: EditSubjectDto = { name: 'verificacion' };
      const expected = { status: 200, message: 'Subject updated successfully' };
      service.editSubject.mockResolvedValue(expected);

      const result = await controller.editSubject(1, dto);

      expect(service.editSubject).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  // DELETE /subjects/:id
  describe('removeSubject', () => {
    it('deberia delegar en subjectService.remove(id)', async () => {
      const expected = { status: 200, message: 'Subject deleted successfully' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.removeSubject(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // POST /subjects/classes (agregar clase)
  describe('addClass', () => {
    it('deberia delegar en subjectService.addClass(userId, dto)', async () => {
      const dto: AddClassDto = {
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '10:00',
        subjectId: 1,
      };
      const expected = { status: 201, message: 'Class created successfully' };
      service.addClass.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.addClass(req, dto);

      expect(service.addClass).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expected);
    });
  });

  // DELETE /subjects/classes/:id (eliminar clase)
  describe('deleteClass', () => {
    it('deberia delegar en subjectService.removeClass(userId, id)', async () => {
      const expected = { status: 200, message: 'Class deleted successfully' };
      service.removeClass.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.deleteClass(req, 5);

      expect(service.removeClass).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual(expected);
    });
  });

  // PATCH /subjects/classes/:id (editar clase)
  describe('editClass', () => {
    it('deberia delegar en subjectService.editClass(userId, id, dto)', async () => {
      const dto: EditClassDto = {
        dayOfWeek: 'tuesday',
        startTime: '10:00',
        endTime: '12:00',
      };
      const expected = { status: 200, message: 'Class updated successfully' };
      service.editClass.mockResolvedValue(expected);
      const req = { user: { sub: 1 } };

      const result = await controller.editClass(req, 5, dto);

      expect(service.editClass).toHaveBeenCalledWith(1, 5, dto);
      expect(result).toEqual(expected);
    });
  });
});