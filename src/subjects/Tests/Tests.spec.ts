import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from '../subjects.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from '../entities/subject.entity';
import { SubjectClass } from '../entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('SubjectsService - Módulo de asignaturas', () => {

  let service: SubjectsService;

  let subjectRepository: jest.Mocked<Repository<Subject>>;
  let subjectClassRepository: jest.Mocked<Repository<SubjectClass>>;
  let userService: jest.Mocked<UsersService>;

  const userMock = {
    id: 1,
  } as any;

  const subjectMock = {
    id: 10,
    name: 'validación',
    professor: 'Gabriel',
    color: '#0078d4',
    user: userMock,
  } as any;


  beforeEach(async () => {

    subjectRepository = {
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      preload: jest.fn(),
    } as any;

    subjectClassRepository = {
      findBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      preload: jest.fn(),
    } as any;

    userService = {
      findOneById: jest.fn(),
    } as any;

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          SubjectsService,
          {
            provide: getRepositoryToken(Subject),
            useValue: subjectRepository,
          },
          {
            provide: getRepositoryToken(SubjectClass),
            useValue: subjectClassRepository,
          },
          {
            provide: UsersService,
            useValue: userService,
          },
        ],
      }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });


  //Consultar detalle de asignatura (F08)

  describe('Consultar detalle', () => {

    // Camino:
    // 1,2,3,4,5,6,9
    it('debe lanzar error cuando la asignatura no existe', async () => {

      subjectRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.getSubject(999)
      ).rejects.toThrow(
        new NotFoundException('The subject does not exist')
      );

      expect(subjectRepository.findOneBy)
        .toHaveBeenCalledWith({
          id: 999,
        });
    });


    // Camino:
    // 1,2,3,4,5,7,8,9
    it('debe retornar la asignatura cuando existe', async () => {

      subjectRepository.findOneBy.mockResolvedValue(subjectMock);

      const result = await service.getSubject(10);

      expect(subjectRepository.findOneBy)
        .toHaveBeenCalledWith({
          id: 10,
        });

      expect(result).toEqual({
        status: 200,
        message: 'Subject rectrieved successfully',
        data: {
          id: 10,
          name: 'validación',
          professor: 'Gabriel',
          color: '#0078d4',
        },
      });
    });

  });


  //Registrar asignatura académica (F09)

  describe('Registrar asignatura', () => {

    const addSubjectDto = {
      name: 'validación',
      professor: 'Gabriel',
      color: '#0078d4',
    };


    // Camino:
    // 1,2,3,4,5,9
    it('debe lanzar error cuando el usuario no existe', async () => {

      userService.findOneById.mockResolvedValue(null);

      await expect(
        service.addSubject(1, addSubjectDto)
      ).rejects.toThrow(
        new NotFoundException('User not found')
      );

      expect(userService.findOneById)
        .toHaveBeenCalledWith(1);

      expect(subjectRepository.create).not.toHaveBeenCalled();
    });


    // Camino:
    // 1,2,3,4,6,7,8,9
    it('debe crear la asignatura correctamente cuando el usuario existe', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectRepository.create.mockReturnValue(subjectMock);

      subjectRepository.save.mockResolvedValue(subjectMock);

      const result = await service.addSubject(1, addSubjectDto);

      expect(subjectRepository.create)
        .toHaveBeenCalledWith({
          name: 'validación',
          professor: 'Gabriel',
          color: '#0078d4',
          user: userMock,
        });

      expect(subjectRepository.save)
        .toHaveBeenCalledWith(subjectMock);

      expect(result).toEqual({
        status: 201,
        message: 'Subject created successfully',
      });
    });

  });


  //Editar asignatura académica (F10)

  describe('Editar asignatura', () => {

    const editSubjectDto = {
      name: 'estructuras de datos',
    };


    // Camino:
    // 1,2,3,4,5,8
    it('debe lanzar error cuando la asignatura no existe', async () => {

      subjectRepository.preload.mockResolvedValue(undefined);

      await expect(
        service.editSubject(999, editSubjectDto)
      ).rejects.toThrow(
        new NotFoundException('The subject does not exist')
      );

      expect(subjectRepository.preload)
        .toHaveBeenCalledWith({
          id: 999,
          ...editSubjectDto,
        });

      expect(subjectRepository.save).not.toHaveBeenCalled();
    });


    // Camino:
    // 1,2,3,4,6,7,8
    it('debe actualizar la asignatura correctamente', async () => {

      const preloaded = { ...subjectMock, name: 'estructuras de datos' };

      subjectRepository.preload.mockResolvedValue(preloaded);

      subjectRepository.save.mockResolvedValue(preloaded);

      const result = await service.editSubject(10, editSubjectDto);

      expect(subjectRepository.preload)
        .toHaveBeenCalledWith({
          id: 10,
          ...editSubjectDto,
        });

      expect(subjectRepository.save)
        .toHaveBeenCalledWith(preloaded);

      expect(result).toEqual({
        status: 200,
        message: 'Subject updated successfully',
      });
    });

  });


  //Eliminar asignatura académica (F11)

  describe('Eliminar asignatura', () => {

    // Camino:
    // 1,2,3,4,5,8
    it('debe lanzar error cuando la asignatura no existe', async () => {

      subjectRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.remove(999)
      ).rejects.toThrow(
        new NotFoundException('The subject does not exist')
      );

      expect(subjectRepository.findOneBy)
        .toHaveBeenCalledWith({
          id: 999,
        });

      expect(subjectRepository.delete).not.toHaveBeenCalled();
    });


    // Camino:
    // 1,2,3,4,6,7,8
    it('debe eliminar la asignatura correctamente', async () => {

      subjectRepository.findOneBy.mockResolvedValue(subjectMock);

      subjectRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      } as any);

      const result = await service.remove(10);

      expect(subjectRepository.findOneBy)
        .toHaveBeenCalledWith({
          id: 10,
        });

      expect(subjectRepository.delete)
        .toHaveBeenCalledWith(10);

      expect(result).toEqual({
        status: 200,
        message: 'Subject deleted successfully',
      });
    });

  });

});