import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Subject } from './entities/subject.entity';
import { SubjectClass } from './entities/subject-class.entity';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Should } from 'src/common/fluent-assertions';

const JWT_TEST_SECRET = 'test-secret-key-new-tests';

describe('Nuevas pruebas de regresión: API, Seguridad y Performance (Backend)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let subjectRepository: any;
  let subjectClassRepository: any;
  let userService: any;
  let tokenUserA: string;
  let tokenUserB: string;

  const userA = { id: 1, email: 'usuarioA@test.com' };
  const userB = { id: 2, email: 'usuarioB@test.com' };

  const mockSubject = {
    id: 10,
    name: 'validacion',
    professor: 'gabriel',
    color: '#0078d4',
    credits: 3,
  };

  const mockClass = {
    id: 100,
    dayOfWeek: 'monday',
    startTime: '08:00',
    endTime: '10:00',
    subject: mockSubject,
    user: userA,
  };

  beforeAll(async () => {
    subjectRepository = {
      findOneBy: jest.fn(),
      findBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    subjectClassRepository = {
      findBy: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    userService = { findOneById: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_TEST_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [SubjectsController],
      providers: [
        SubjectsService,
        JwtStrategy,
        { provide: getRepositoryToken(Subject), useValue: subjectRepository },
        { provide: getRepositoryToken(SubjectClass), useValue: subjectClassRepository },
        { provide: UsersService, useValue: userService },
        { provide: ConfigService, useValue: { get: () => JWT_TEST_SECRET } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = moduleRef.get(JwtService);
    tokenUserA = await jwtService.signAsync({ sub: userA.id, email: userA.email });
    tokenUserB = await jwtService.signAsync({ sub: userB.id, email: userB.email });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Consultar horario de clases', () => {
    describe('API', () => {
      it('sin token de autenticacion -> 401', () => {
        return request(app.getHttpServer()).get('/subjects/classes').expect(401);
      });

      it('con token valido -> 200 y el arreglo de clases con la asignatura embebida', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectClassRepository.findBy.mockResolvedValue([mockClass]);

        const res = await request(app.getHttpServer())
          .get('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data).HaveCount(1);
        Should(res.body.data[0].subject.name).Be('validacion');
      });
    });

    describe('Seguridad', () => {
      it('debe consultar únicamente las clases del usuario autenticado (segun el id del token, no uno arbitrario)', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectClassRepository.findBy.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(subjectClassRepository.findBy).HaveBeenCalledWith({
          user: { id: userA.id },
        });
      });

      it('con token invalido -> 401', () => {
        return request(app.getHttpServer())
          .get('/subjects/classes')
          .set('Authorization', 'Bearer token.invalido.corrupto')
          .expect(401);
      });
    });

    describe('Performance', () => {
      it('debe responder en menos de 300ms con 1000 clases (mockeado)', async () => {
        userService.findOneById.mockResolvedValue(userA);
        const manyClasses = Array.from({ length: 1000 }, (_, i) => ({
          ...mockClass,
          id: i + 1,
        }));
        subjectClassRepository.findBy.mockResolvedValue(manyClasses);

        const start = Date.now();
        const res = await request(app.getHttpServer())
          .get('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);
        const elapsedMs = Date.now() - start;

        Should(res.body.data).HaveCount(1000);
        Should(elapsedMs).BeLessThan(300);
      });
    });
  });

  describe('Agregar clase', () => {
    const validPayload = {
      dayOfWeek: 'tuesday',
      startTime: '08:00',
      endTime: '10:00',
      subjectId: 10,
    };

    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer())
          .post('/subjects/classes')
          .send(validPayload)
          .expect(401);
      });

      it('con un campo requerido faltante (dayOfWeek) -> 400', async () => {
        userService.findOneById.mockResolvedValue(userA);
        const { dayOfWeek, ...incompleto } = validPayload;

        await request(app.getHttpServer())
          .post('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(incompleto)
          .expect(400);
      });

      it('con un campo extra no permitido en el payload -> 400', async () => {
        userService.findOneById.mockResolvedValue(userA);

        await request(app.getHttpServer())
          .post('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, campoMalicioso: 'hack' })
          .expect(400);
      });

      it('payload valido -> 201', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectClassRepository.create.mockReturnValue(mockClass);
        subjectClassRepository.save.mockResolvedValue(mockClass);

        await request(app.getHttpServer())
          .post('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(201);
      });
    });

    describe('Seguridad', () => {
      it('rechaza la asignatura inexistente -> 404', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectRepository.findOneBy.mockResolvedValue(null);

        await request(app.getHttpServer())
          .post('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(404);
      });

      it('rechaza horario contradictorio (endTime antes que startTime) -> 409', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .post('/subjects/classes')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, startTime: '10:00', endTime: '08:00' })
          .expect(409);
      });
    });

    describe('Performance', () => {
      it('debe completar 50 creaciones secuenciales en menos de 1500ms', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectClassRepository.create.mockReturnValue(mockClass);
        subjectClassRepository.save.mockResolvedValue(mockClass);

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .post('/subjects/classes')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send(validPayload)
            .expect(201);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Editar clase', () => {
    const validPayload = { dayOfWeek: 'friday', startTime: '09:00', endTime: '11:00' };

    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer())
          .patch('/subjects/classes/100')
          .send(validPayload)
          .expect(401);
      });

      it('con un campo de tipo incorrecto (startTime numerico) -> 400', async () => {
        userService.findOneById.mockResolvedValue(userA);

        await request(app.getHttpServer())
          .patch('/subjects/classes/100')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, startTime: 800 })
          .expect(400);
      });

      it('payload valido -> 200', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectClassRepository.preload.mockResolvedValue({ ...mockClass, ...validPayload });
        subjectClassRepository.save.mockResolvedValue({});

        await request(app.getHttpServer())
          .patch('/subjects/classes/100')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(200);
      });
    });

    describe('Seguridad', () => {
      it('clase inexistente -> 404', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectClassRepository.preload.mockResolvedValue(undefined);

        await request(app.getHttpServer())
          .patch('/subjects/classes/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(404);
      });
    });

    describe('Performance', () => {
      it('debe completar 50 ediciones secuenciales en menos de 1500ms', async () => {
        userService.findOneById.mockResolvedValue(userA);
        subjectClassRepository.preload.mockResolvedValue({ ...mockClass, ...validPayload });
        subjectClassRepository.save.mockResolvedValue({});

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .patch('/subjects/classes/100')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send(validPayload)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Eliminar clase', () => {
    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer()).delete('/subjects/classes/100').expect(401);
      });

      it('con id valido y de su propiedad -> 200', async () => {
        subjectClassRepository.findOne.mockResolvedValue(mockClass);
        subjectClassRepository.delete.mockResolvedValue({ affected: 1 });

        await request(app.getHttpServer())
          .delete('/subjects/classes/100')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);
      });

      it('con id inexistente -> 404', async () => {
        subjectClassRepository.findOne.mockResolvedValue(null);

        await request(app.getHttpServer())
          .delete('/subjects/classes/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(404);
      });
    });

    describe('Seguridad', () => {
      it('el Usuario B no puede eliminar una clase del Usuario A -> 404', async () => {
        subjectClassRepository.findOne.mockResolvedValue(null);

        await request(app.getHttpServer())
          .delete('/subjects/classes/100')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .expect(404);

        Should(subjectClassRepository.findOne).HaveBeenCalledWith({
          where: { id: 100, user: { id: userB.id } },
        });
      });
    });

    describe('Performance', () => {
      it('debe completar 50 eliminaciones secuenciales en menos de 1500ms', async () => {
        subjectClassRepository.findOne.mockResolvedValue(mockClass);
        subjectClassRepository.delete.mockResolvedValue({ affected: 1 });

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .delete('/subjects/classes/100')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Acceder a detalles de asignatura', () => {
    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer()).get('/subjects/10').expect(401);
      });

      it('con id inexistente -> 404', async () => {
        subjectRepository.findOneBy.mockResolvedValue(null);

        await request(app.getHttpServer())
          .get('/subjects/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(404);
      });

      it('con id valido -> 200 y los datos correctos de la asignatura', async () => {
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        const res = await request(app.getHttpServer())
          .get('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data.name).Be('validacion');
        Should(res.body.data.professor).Be('gabriel');
      });

      it('con un id no numerico en la ruta -> 400', () => {
        return request(app.getHttpServer())
          .get('/subjects/no-es-un-numero')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(400);
      });
    });

    describe('Performance', () => {
      it('debe completar 50 consultas secuenciales en menos de 1500ms', async () => {
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .get('/subjects/10')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });
});