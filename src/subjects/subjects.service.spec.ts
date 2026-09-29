import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { ContradictoryTimeException } from './exceptions/contradictory-time.exception';
import { Should } from 'src/common/fluent-assertions';

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
    name: 'validacion',
    professor: 'gabriel',
    color: '#0078d4',
    credits: 3,
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
      createQueryBuilder: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
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

  it('deberia estar definido', () => {
    service.Should().BeDefined();
  });

  describe('Consultar horario', () => {
    // Camino:
    // 1,2,3,4,5,10
    it('debe lanzar error cuando el usuario no existe', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.getClassesByid(1)).ThrowAsync(
        NotFoundException,
      );

      Should(userService.findOneById).HaveBeenCalledWith(1);
    });

    // Camino:
    // 1,2,3,4,6,7,8,10
    it('debe retornar arreglo vacio cuando el usuario no tiene clases', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectClassRepository.findBy.mockResolvedValue([]);

      // Act
      const result = await service.getClassesByid(1);

      // Assert (Fluent Assertions)
      result.Should().BeEquivalentTo({
        status: 200,
        message: 'The user has no classes',
        data: [],
      });

      Should(subjectClassRepository.findBy).HaveBeenCalledWith({
        user: {
          id: 1,
        },
      });
    });

    // Camino:
    // 1,2,3,4,6,7,9,10
    it('debe retornar las clases del usuario con la informacion de su asignatura', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectClassRepository.findBy.mockResolvedValue([classMock]);

      // Act
      const result = await service.getClassesByid(1);

      // Assert (Fluent Assertions)
      result.Should().BeEquivalentTo({
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
              name: 'validacion',
              professor: 'gabriel',
              color: '#0078d4',
              credits: 3,
            },
          },
        ],
      });
    });
  });

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
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.addClass(1, addClassDto)).ThrowAsync(
        NotFoundException,
      );

      Should(userService.findOneById).HaveBeenCalledWith(1);
    });

    // Camino:
    // 1,2,3,4,5,7,6,10
    it('debe lanzar error cuando la asignatura no existe', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.addClass(1, addClassDto)).ThrowAsync(
        NotFoundException,
      );

      Should(subjectRepository.findOneBy).HaveBeenCalledWith({
        id: 10,
      });
    });

    it('debe lanzar error "Subject not found" si getSubjectById resuelve un valor falso', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      jest
        .spyOn(service, 'getSubjectById')
        .mockResolvedValue(undefined as any);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.addClass(1, addClassDto)).ThrowAsync(
        NotFoundException,
      );

      Should(service.getSubjectById).HaveBeenCalledWith(10);
      Should(subjectClassRepository.create).NotHaveBeenCalled();
    });

    it('debe lanzar ContradictoryTimeException cuando endTime es anterior a startTime', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findOneBy.mockResolvedValue(subjectMock);

      const dtoConHorarioInvalido = {
        ...addClassDto,
        startTime: '10:00',
        endTime: '08:00',
      };

      // Act & Assert (Fluent Exception Assertion)
      await Should(() =>
        service.addClass(1, dtoConHorarioInvalido),
      ).ThrowAsync(ContradictoryTimeException);

      Should(subjectClassRepository.create).NotHaveBeenCalled();
      Should(subjectClassRepository.save).NotHaveBeenCalled();
    });

    // Camino:
    // 1,2,3,4,5,7,8,9,10
    it('debe crear la clase correctamente cuando usuario y asignatura existen', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectRepository.findOneBy.mockResolvedValue(subjectMock);
      subjectClassRepository.create.mockReturnValue(classMock);
      subjectClassRepository.save.mockResolvedValue(classMock);

      // Act
      const result = await service.addClass(1, addClassDto);

      // Assert (Fluent Assertions)
      Should(subjectClassRepository.create).HaveBeenCalledWith({
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '10:00',
        subject: subjectMock,
        user: userMock,
      });

      Should(subjectClassRepository.save).HaveBeenCalledWith(classMock);

      result.Should().BeEquivalentTo({
        status: 201,
        message: 'Class created successfully',
      });
    });
  });

  describe('Eliminar clase', () => {
    // Camino:
    // 1,2,3,4,5,7,8
    it('debe lanzar error cuando la clase no pertenece al usuario o no existe', async () => {
      // Arrange
      subjectClassRepository.findOne.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.removeClass(1, 5)).ThrowAsync(
        NotFoundException,
      );

      Should(subjectClassRepository.findOne).HaveBeenCalledWith({
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
      // Arrange
      subjectClassRepository.findOne.mockResolvedValue(classMock);
      subjectClassRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      } as any);

      // Act
      const result = await service.removeClass(1, 5);

      // Assert (Fluent Assertions)
      Should(subjectClassRepository.delete).HaveBeenCalledWith(5);

      result.Should().BeEquivalentTo({
        status: 200,
        message: 'Class deleted successfully',
      });
    });
  });

  describe('Editar clase', () => {
    const editClassDto = {
      dayOfWeek: 'tuesday',
      startTime: '10:00',
      endTime: '12:00',
    };

    // Camino:
    // 1,2,3,4,5,7,10
    it('debe lanzar error cuando el usuario no existe', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.editClass(1, 5, editClassDto)).ThrowAsync(
        NotFoundException,
      );

      Should(userService.findOneById).HaveBeenCalledWith(1);
    });

    // Camino:
    // 1,2,3,4,5,6,8,7,10
    it('debe lanzar error cuando la clase no existe', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectClassRepository.preload.mockResolvedValue(undefined);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.editClass(1, 5, editClassDto)).ThrowAsync(
        NotFoundException,
      );

      Should(subjectClassRepository.preload).HaveBeenCalledWith({
        id: 5,
        ...editClassDto,
      });
    });

    // Camino:
    // 1,2,3,4,5,6,8,9,10
    it('debe actualizar la clase correctamente', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      subjectClassRepository.preload.mockResolvedValue(classMock);
      subjectClassRepository.save.mockResolvedValue(classMock);

      // Act
      const result = await service.editClass(1, 5, editClassDto);

      // Assert (Fluent Assertions)
      Should(subjectClassRepository.preload).HaveBeenCalledWith({
        id: 5,
        ...editClassDto,
      });

      Should(subjectClassRepository.save).HaveBeenCalledWith(classMock);

      result.Should().BeEquivalentTo({
        status: 200,
        message: 'Class updated successfully',
      });
    });
  });

  describe('searchSubjects', () => {
    function mockQueryBuilder(returnValue: any[]) {
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(returnValue),
      };
      (subjectRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      return qb;
    }

    it('should throw NotFoundException when the user does not exist', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(null);

      // Act & Assert (Fluent Exception Assertion)
      await Should(() => service.searchSubjects(999, 'algo')).ThrowAsync(
        NotFoundException,
      );

      Should(subjectRepository.createQueryBuilder).NotHaveBeenCalled();
    });

    it('should return an empty result without querying when the search term is blank', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);

      // Act
      const result = await service.searchSubjects(1, '   ');

      // Assert (Fluent Assertions)
      result.Should().BeEquivalentTo({
        status: 200,
        message: 'Search query is required',
        data: [],
      });

      Should(subjectRepository.createQueryBuilder).NotHaveBeenCalled();
    });

    it('should return an empty result when no subjects match the search', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      const qb = mockQueryBuilder([]);

      // Act
      const result = await service.searchSubjects(1, 'inexistente');

      // Assert (Fluent Assertions)
      Should(qb.andWhere).HaveBeenCalledWith(
        '(subject.name LIKE :term OR subject.professor LIKE :term)',
        { term: '%inexistente%' },
      );

      result.Should().BeEquivalentTo({
        status: 200,
        message: 'No subjects found matching the search',
        data: [],
      });
    });

    it('should return matching subjects, defaulting credits to 3 when unset', async () => {
      // Arrange
      userService.findOneById.mockResolvedValue(userMock);
      mockQueryBuilder([{ ...subjectMock, credits: undefined }]);

      // Act
      const result = await service.searchSubjects(1, 'valid');

      // Assert (Fluent Assertions)
      result.status.Should().Be(200);
      result.message.Should().Be('Subjects retrieved successfully');
      result.data.Should().BeEquivalentTo([
        {
          id: subjectMock.id,
          name: subjectMock.name,
          professor: subjectMock.professor,
          color: subjectMock.color,
          credits: 3,
        },
      ]);
    });
  });
});
