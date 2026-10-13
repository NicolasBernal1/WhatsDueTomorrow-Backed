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

const JWT_TEST_SECRET = 'test-secret-key-subjects-api-security-performance';

describe('Nuevas pruebas de regresión: API, Seguridad y Performance de Asignaturas (Backend)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let subjectRepository: any;
  let subjectClassRepository: any;
  let userService: any;
  let queryBuilder: any;
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
    user: userA,
  };

  const manySubjects = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      ...mockSubject,
      id: i + 1,
      name: `Materia ${i + 1}`,
    }));

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

  beforeEach(() => {
    userService.findOneById.mockResolvedValue(userA);
    queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockSubject]),
    };
    subjectRepository.createQueryBuilder.mockReturnValue(queryBuilder);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Listar asignaturas', () => {
    describe('API', () => {
      it('sin token de autenticacion -> 401', () => {
        return request(app.getHttpServer()).get('/subjects').expect(401);
      });

      it('con token valido -> 200 y el arreglo de asignaturas del usuario', async () => {
        subjectRepository.findBy.mockResolvedValue([mockSubject]);

        const res = await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data).HaveCount(1);
        Should(res.body.data[0].name).Be('validacion');
      });

      it('usuario sin asignaturas -> 200 con arreglo vacio', async () => {
        subjectRepository.findBy.mockResolvedValue([]);

        const res = await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data).BeEmpty();
      });
    });

    describe('Seguridad', () => {
      it('debe consultar únicamente las asignaturas del usuario autenticado (segun el id del token, no uno arbitrario)', async () => {
        subjectRepository.findBy.mockResolvedValue([]);

        await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .expect(200);

        Should(subjectRepository.findBy).HaveBeenCalledWith({
          user: { id: userB.id },
        });
      });

      it('con token invalido -> 401', () => {
        return request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', 'Bearer token.invalido.corrupto')
          .expect(401);
      });

      it('con token expirado -> 401', async () => {
        const expirado = await jwtService.signAsync(
          { sub: userA.id, email: userA.email },
          { expiresIn: '-10s' },
        );

        await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${expirado}`)
          .expect(401);
      });

      it('con token firmado con otro secreto -> 401', async () => {
        const falsificado = await new JwtService({ secret: 'otro-secreto' }).signAsync({
          sub: userA.id,
          email: userA.email,
        });

        await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${falsificado}`)
          .expect(401);
      });
    });

    describe('Performance', () => {
      it('debe responder en menos de 300ms con 1000 asignaturas (mockeado)', async () => {
        subjectRepository.findBy.mockResolvedValue(manySubjects(1000));

        const start = Date.now();
        const res = await request(app.getHttpServer())
          .get('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);
        const elapsedMs = Date.now() - start;

        Should(res.body.data).HaveCount(1000);
        Should(elapsedMs).BeLessThan(300);
      });
    });
  });

  describe('Acceder a detalles de asignatura', () => {
    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer()).get('/subjects/10').expect(401);
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

      it('con id inexistente -> 404', async () => {
        subjectRepository.findOneBy.mockResolvedValue(null);

        await request(app.getHttpServer())
          .get('/subjects/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(404);
      });

      it('con un id no numerico en la ruta -> 400', () => {
        return request(app.getHttpServer())
          .get('/subjects/no-es-un-numero')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(400);
      });
    });

    describe('Seguridad', () => {
      it('un id con intento de inyeccion SQL -> 400 sin consultar la BD', async () => {
        await request(app.getHttpServer())
          .get(`/subjects/${encodeURIComponent('1 OR 1=1')}`)
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(400);

        Should(subjectRepository.findOneBy).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): getSubject/remove/editSubject no verifican que la asignatura
      // pertenezca al usuario del token. `it.failing` pasa mientras el bug exista y
      // avisara (fallando) cuando se corrija, para quitarle el `.failing`.
      it.failing('el Usuario B no deberia ver la asignatura del Usuario A -> 404', async () => {
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .get('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .expect(404);
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

  describe('Registrar asignatura', () => {
    const validPayload = {
      name: 'Ingenieria de Software',
      professor: 'Ana Gomez',
      color: '#28a745',
      credits: 4,
    };

    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer())
          .post('/subjects')
          .send(validPayload)
          .expect(401);
      });

      it('payload valido -> 201', async () => {
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(201);
      });

      it('solo con nombre y profesor (color y creditos opcionales) -> 201 con 3 creditos por defecto', async () => {
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ name: 'Algebra', professor: 'Luis Diaz' })
          .expect(201);

        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ credits: 3 }),
        );
      });

      it('con un campo requerido faltante (name) -> 400', async () => {
        const { name, ...incompleto } = validPayload;

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(incompleto)
          .expect(400);
      });

      it('con un campo requerido faltante (professor) -> 400', async () => {
        const { professor, ...incompleto } = validPayload;

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(incompleto)
          .expect(400);
      });

      it('con el nombre vacio -> 400', async () => {
        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, name: '' })
          .expect(400);
      });

      it.each([0, 13, 3.5, '3', -1])(
        'con creditos invalidos (%p) -> 400',
        async (credits) => {
          await request(app.getHttpServer())
            .post('/subjects')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send({ ...validPayload, credits })
            .expect(400);

          Should(subjectRepository.save).NotHaveBeenCalled();
        },
      );
    });

    describe('Seguridad', () => {
      it('con un campo extra no permitido en el payload -> 400', async () => {
        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, campoMalicioso: 'hack' })
          .expect(400);
      });

      it('no permite asignar la asignatura a otro usuario desde el body -> 400', async () => {
        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, user: { id: userB.id } })
          .expect(400);

        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it('la asignatura creada queda asociada al usuario del token', async () => {
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(201);

        Should(userService.findOneById).HaveBeenCalledWith(userA.id);
        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ user: userA }),
        );
      });

      it('un nombre con HTML se guarda como texto, sin interpretarlo', async () => {
        const xss = '<script>alert(1)</script>';
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        await request(app.getHttpServer())
          .post('/subjects')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, name: xss })
          .expect(201);

        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ name: xss }),
        );
      });
    });

    describe('Performance', () => {
      it('debe completar 50 creaciones secuenciales en menos de 1500ms', async () => {
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .post('/subjects')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send(validPayload)
            .expect(201);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Editar asignatura', () => {
    const validPayload = { name: 'Calculo Integral', professor: 'Sofia Mora' };

    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer())
          .patch('/subjects/10')
          .send(validPayload)
          .expect(401);
      });

      it('payload valido -> 200', async () => {
        subjectRepository.preload.mockResolvedValue({ ...mockSubject, ...validPayload });
        subjectRepository.save.mockResolvedValue({});

        await request(app.getHttpServer())
          .patch('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(200);
      });

      it('con una asignatura inexistente -> 404', async () => {
        subjectRepository.preload.mockResolvedValue(undefined);

        await request(app.getHttpServer())
          .patch('/subjects/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(404);

        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it('con un id no numerico en la ruta -> 400', () => {
        return request(app.getHttpServer())
          .patch('/subjects/no-es-un-numero')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send(validPayload)
          .expect(400);
      });

      it.each([0, 13, 3.5])('con creditos invalidos (%p) -> 400', async (credits) => {
        await request(app.getHttpServer())
          .patch('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ credits })
          .expect(400);

        Should(subjectRepository.save).NotHaveBeenCalled();
      });
    });

    describe('Seguridad', () => {
      it('con un campo extra no permitido en el payload -> 400', async () => {
        await request(app.getHttpServer())
          .patch('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ ...validPayload, campoMalicioso: 'hack' })
          .expect(400);
      });

      it('no permite cambiar el dueño de la asignatura desde el body -> 400', async () => {
        await request(app.getHttpServer())
          .patch('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .send({ user: { id: userB.id } })
          .expect(400);

        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): ver nota en "Acceder a detalles de asignatura".
      it.failing('el Usuario B no deberia editar la asignatura del Usuario A -> 404', async () => {
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.preload.mockResolvedValue({ ...mockSubject, ...validPayload });
        subjectRepository.save.mockResolvedValue({});

        await request(app.getHttpServer())
          .patch('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .send(validPayload)
          .expect(404);
      });
    });

    describe('Performance', () => {
      it('debe completar 50 ediciones secuenciales en menos de 1500ms', async () => {
        subjectRepository.preload.mockResolvedValue({ ...mockSubject, ...validPayload });
        subjectRepository.save.mockResolvedValue({});

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .patch('/subjects/10')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .send(validPayload)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Eliminar asignatura', () => {
    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer()).delete('/subjects/10').expect(401);
      });

      it('con id valido -> 200 y se elimina la asignatura', async () => {
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({ affected: 1 });

        await request(app.getHttpServer())
          .delete('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(subjectRepository.delete).HaveBeenCalledWith(10);
      });

      it('con id inexistente -> 404 y no elimina nada', async () => {
        subjectRepository.findOneBy.mockResolvedValue(null);

        await request(app.getHttpServer())
          .delete('/subjects/99999')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(404);

        Should(subjectRepository.delete).NotHaveBeenCalled();
      });

      it('con un id no numerico en la ruta -> 400', async () => {
        await request(app.getHttpServer())
          .delete('/subjects/no-es-un-numero')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(400);

        Should(subjectRepository.delete).NotHaveBeenCalled();
      });
    });

    describe('Seguridad', () => {
      it('un id con intento de inyeccion SQL -> 400 sin eliminar nada', async () => {
        await request(app.getHttpServer())
          .delete(`/subjects/${encodeURIComponent('10; DROP TABLE subject')}`)
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(400);

        Should(subjectRepository.delete).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): ver nota en "Acceder a detalles de asignatura".
      it.failing('el Usuario B no deberia eliminar la asignatura del Usuario A -> 404', async () => {
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({ affected: 1 });

        await request(app.getHttpServer())
          .delete('/subjects/10')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .expect(404);
      });
    });

    describe('Performance', () => {
      it('debe completar 50 eliminaciones secuenciales en menos de 1500ms', async () => {
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({ affected: 1 });

        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .delete('/subjects/10')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  describe('Buscar asignaturas', () => {
    describe('API', () => {
      it('sin token -> 401', () => {
        return request(app.getHttpServer()).get('/subjects/search?q=validacion').expect(401);
      });

      it('con coincidencias -> 200 y las asignaturas encontradas', async () => {
        const res = await request(app.getHttpServer())
          .get('/subjects/search?q=validacion')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data).HaveCount(1);
        Should(res.body.data[0].name).Be('validacion');
      });

      it('sin coincidencias -> 200 con arreglo vacio', async () => {
        queryBuilder.getMany.mockResolvedValue([]);

        const res = await request(app.getHttpServer())
          .get('/subjects/search?q=quimica')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(res.body.data).BeEmpty();
      });

      it.each(['/subjects/search', '/subjects/search?q=', '/subjects/search?q=%20%20'])(
        'con termino vacio o en blanco (%s) -> 200 con arreglo vacio sin consultar la BD',
        async (url) => {
          const res = await request(app.getHttpServer())
            .get(url)
            .set('Authorization', `Bearer ${tokenUserA}`)
            .expect(200);

          Should(res.body.data).BeEmpty();
          Should(subjectRepository.createQueryBuilder).NotHaveBeenCalled();
        },
      );

      it('la ruta /search no se confunde con /:id (no responde 400 por id no numerico)', async () => {
        const res = await request(app.getHttpServer())
          .get('/subjects/search?q=validacion')
          .set('Authorization', `Bearer ${tokenUserA}`);

        Should(res.status).NotBe(400);
      });
    });

    describe('Seguridad', () => {
      it('debe filtrar siempre por el usuario del token', async () => {
        await request(app.getHttpServer())
          .get('/subjects/search?q=validacion')
          .set('Authorization', `Bearer ${tokenUserB}`)
          .expect(200);

        Should(queryBuilder.where).HaveBeenCalledWith('user.id = :userId', {
          userId: userB.id,
        });
      });

      it('el termino viaja como parametro enlazado: una inyeccion SQL no altera la consulta', async () => {
        const injection = "' OR 1=1 --";

        await request(app.getHttpServer())
          .get(`/subjects/search?q=${encodeURIComponent(injection)}`)
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);

        Should(queryBuilder.andWhere).HaveBeenCalledWith(
          '(subject.name LIKE :term OR subject.professor LIKE :term)',
          { term: `%${injection}%` },
        );
      });

      it('con un usuario inexistente en la BD -> 404', async () => {
        userService.findOneById.mockResolvedValue(null);

        await request(app.getHttpServer())
          .get('/subjects/search?q=validacion')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(404);
      });
    });

    describe('Performance', () => {
      it('debe responder en menos de 300ms con 1000 coincidencias (mockeado)', async () => {
        queryBuilder.getMany.mockResolvedValue(manySubjects(1000));

        const start = Date.now();
        const res = await request(app.getHttpServer())
          .get('/subjects/search?q=materia')
          .set('Authorization', `Bearer ${tokenUserA}`)
          .expect(200);
        const elapsedMs = Date.now() - start;

        Should(res.body.data).HaveCount(1000);
        Should(elapsedMs).BeLessThan(300);
      });

      it('debe completar 50 busquedas secuenciales en menos de 1500ms', async () => {
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          await request(app.getHttpServer())
            .get('/subjects/search?q=validacion')
            .set('Authorization', `Bearer ${tokenUserA}`)
            .expect(200);
        }
        const elapsedMs = Date.now() - start;

        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });
});
