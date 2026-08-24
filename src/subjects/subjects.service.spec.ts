import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('SubjectsService - Módulo de clases', () => {

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

  const classMock = {
    id: 5,
    dayOfWeek: 'monday',
    startTime: '08:00',
    endTime: '10:00',
    subject: subjectMock,
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


  //Consultar horario

  describe('Consultar horario', () => {

    // Camino:
    // 1,2,3,4,5,10
    it('debe lanzar error cuando el usuario no existe', async () => {

      userService.findOneById.mockResolvedValue(null);

      await expect(
        service.getClassesByid(1)
      ).rejects.toThrow(
        new NotFoundException('User not found')
      );

      expect(userService.findOneById)
        .toHaveBeenCalledWith(1);
    });


    // Camino:
    // 1,2,3,4,6,7,8,10
    it('debe retornar arreglo vacío cuando el usuario no tiene clases', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectClassRepository.findBy.mockResolvedValue([]);

      const result = await service.getClassesByid(1);

      expect(result).toEqual({
        status: 200,
        message: 'The user has no classes',
        data: [],
      });

      expect(subjectClassRepository.findBy)
        .toHaveBeenCalledWith({
          user: {
            id: 1,
          },
        });
    });


    // Camino:
    // 1,2,3,4,6,7,9,10
    it('debe retornar las clases del usuario con la información de su asignatura', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectClassRepository.findBy.mockResolvedValue([
        classMock,
      ]);

      const result = await service.getClassesByid(1);

      expect(result).toEqual({
        status: 200,
        message: 'Classes retrieved successfully',
        data: [
          {
            id: 5,
            dayOfWeek: 'monday',
            startTime: '08:00',
            endTime: '10:00',
            subject: {
              id: 10,
              name: 'validación',
              professor: 'Gabriel',
              color: '#0078d4',
            },
          },
        ],
      });
    });

  });


  //Registrar clase

  describe('Registrar clase', () => {

    const addClassDto = {
      subjectId: 10,
      dayOfWeek: 'monday',
      startTime: '08:00',
      endTime: '10:00',
    };


    // Camino:
    // 1,2,3,4,6,10
    it('debe lanzar error cuando el usuario no existe', async () => {

      userService.findOneById.mockResolvedValue(null);

      await expect(
        service.addClass(1, addClassDto)
      ).rejects.toThrow(
        new NotFoundException('User not found')
      );

      expect(userService.findOneById)
        .toHaveBeenCalledWith(1);
    });


    // Camino:
    // 1,2,3,4,5,7,6,10
    it('debe lanzar error cuando la asignatura no existe', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.addClass(1, addClassDto)
      ).rejects.toThrow(
        new NotFoundException('The subject does not exist')
      );

      expect(subjectRepository.findOneBy)
        .toHaveBeenCalledWith({
          id: 10,
        });
    });


    // Camino:
    // 1,2,3,4,5,7,8,9,10
    it('debe crear la clase correctamente cuando usuario y asignatura existen', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectRepository.findOneBy.mockResolvedValue(subjectMock);

      subjectClassRepository.create.mockReturnValue(
        classMock
      );

      subjectClassRepository.save.mockResolvedValue(
        classMock
      );

      const result = await service.addClass(
        1,
        addClassDto
      );

      expect(subjectClassRepository.create)
        .toHaveBeenCalledWith({
          dayOfWeek: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          subject: subjectMock,
          user: userMock,
        });

      expect(subjectClassRepository.save)
        .toHaveBeenCalledWith(classMock);

      expect(result).toEqual({
        status: 201,
        message: 'Class created successfully',
      });
    });

  });


  //Eliminar clase

  describe('Eliminar clase', () => {

    // Camino:
    // 1,2,3,4,5,7,8
    it('debe lanzar error cuando la clase no pertenece al usuario o no existe', async () => {

      subjectClassRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeClass(1, 5)
      ).rejects.toThrow(
        new NotFoundException(
          'Class not found or not owned by user'
        )
      );

      expect(subjectClassRepository.findOne)
        .toHaveBeenCalledWith({
          where: {
            id: 5,
            user: {
              id: 1,
            },
          },
        });
    });


    // Camino:
    // 1,2,3,4,5,6,8
    it('debe eliminar la clase correctamente', async () => {

      subjectClassRepository.findOne.mockResolvedValue(
        classMock
      );

      subjectClassRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      } as any);

      const result = await service.removeClass(1, 5);

      expect(subjectClassRepository.delete)
        .toHaveBeenCalledWith(5);

      expect(result).toEqual({
        status: 200,
        message: 'Class deleted successfully',
      });
    });

  });


  //Editar clase

  describe('Editar clase', () => {

    const editClassDto = {
      dayOfWeek: 'tuesday',
      startTime: '10:00',
      endTime: '12:00',
    };


    // Camino:
    // 1,2,3,4,5,7,10
    it('debe lanzar error cuando el usuario no existe', async () => {

      userService.findOneById.mockResolvedValue(null);

      await expect(
        service.editClass(1, 5, editClassDto)
      ).rejects.toThrow(
        new NotFoundException('User not found')
      );

      expect(userService.findOneById)
        .toHaveBeenCalledWith(1);
    });


    // Camino:
    // 1,2,3,4,5,6,8,7,10
    it('debe lanzar error cuando la clase no existe', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectClassRepository.preload.mockResolvedValue(
        undefined
      );

      await expect(
        service.editClass(1, 5, editClassDto)
      ).rejects.toThrow(
        new NotFoundException(
          'Class not found or not owned by user'
        )
      );

      expect(subjectClassRepository.preload)
        .toHaveBeenCalledWith({
          id: 5,
          ...editClassDto,
        });
    });


    // Camino:
    // 1,2,3,4,5,6,8,9,10
    it('debe actualizar la clase correctamente', async () => {

      userService.findOneById.mockResolvedValue(userMock);

      subjectClassRepository.preload.mockResolvedValue(
        classMock
      );

      subjectClassRepository.save.mockResolvedValue(
        classMock
      );

      const result = await service.editClass(
        1,
        5,
        editClassDto
      );

      expect(subjectClassRepository.preload)
        .toHaveBeenCalledWith({
          id: 5,
          ...editClassDto,
        });

      expect(subjectClassRepository.save)
        .toHaveBeenCalledWith(classMock);

      expect(result).toEqual({
        status: 200,
        message: 'Class updated successfully',
      });
    });

  });

}); 