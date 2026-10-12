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

/**
 * Pruebas de API, Seguridad y Performance de las funcionalidades de asignaturas:
 * F07 Listar, F08 Detalle, F09 Registrar, F10 Editar, F11 Eliminar y Buscar..
 */
describe('Asignaturas: API, Seguridad y Performance (Backend)', () => {
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
    name: 'Calculo',
    professor: 'Lugel Franco',
    color: '#007bff',
    credits: 4,
    user: userA,
  };

  const validNewSubject = {
    name: 'Ingenieria de Software',
    professor: 'Ana Gomez',
    color: '#28a745',
    credits: 4,
  };

  const manySubjects = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      ...mockSubject,
      id: i + 1,
      name: `Materia ${i + 1}`,
    }));

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const http = () => request(app.getHttpServer());

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
        {
          provide: getRepositoryToken(SubjectClass),
          useValue: subjectClassRepository,
        },
        { provide: UsersService, useValue: userService },
        { provide: ConfigService, useValue: { get: () => JWT_TEST_SECRET } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleRef.get(JwtService);
    tokenUserA = await jwtService.signAsync({
      sub: userA.id,
      email: userA.email,
    });
    tokenUserB = await jwtService.signAsync({
      sub: userB.id,
      email: userB.email,
    });
  });

  beforeEach(() => {
    queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockSubject]),
    };
    subjectRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    userService.findOneById.mockResolvedValue(userA);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('F07 Listar asignaturas (GET /subjects)', () => {
    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().get('/subjects');

        // Assert
        Should(res.status).Be(401);
      });

      it('con token valido -> 200 y el arreglo de asignaturas del usuario', async () => {
        // Arrange
        subjectRepository.findBy.mockResolvedValue([mockSubject]);

        // Act
        const res = await http().get('/subjects').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.data).HaveCount(1);
        Should(res.body.data[0]).BeEquivalentTo({
          id: 10,
          name: 'Calculo',
          professor: 'Lugel Franco',
          color: '#007bff',
          credits: 4,
        });
      });

      it('usuario sin asignaturas -> 200 con arreglo vacio', async () => {
        // Arrange
        subjectRepository.findBy.mockResolvedValue([]);

        // Act
        const res = await http().get('/subjects').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.data).BeEmpty();
      });
    });

    describe('Seguridad', () => {
      it('consulta unicamente las asignaturas del usuario del token', async () => {
        // Arrange
        subjectRepository.findBy.mockResolvedValue([]);

        // Act
        await http().get('/subjects').set(auth(tokenUserB));

        // Assert
        Should(subjectRepository.findBy).HaveBeenCalledWith({
          user: { id: userB.id },
        });
      });

      it('token invalido -> 401', async () => {
        // Act
        const res = await http()
          .get('/subjects')
          .set('Authorization', 'Bearer token.invalido.corrupto');

        // Assert
        Should(res.status).Be(401);
      });

      it('token expirado -> 401', async () => {
        // Arrange
        const expired = await jwtService.signAsync(
          { sub: userA.id, email: userA.email },
          { expiresIn: '-10s' },
        );

        // Act
        const res = await http().get('/subjects').set(auth(expired));

        // Assert
        Should(res.status).Be(401);
      });

      it('token firmado con otro secreto -> 401', async () => {
        // Arrange
        const forged = await new JwtService({ secret: 'otro-secreto' }).signAsync(
          { sub: userA.id, email: userA.email },
        );

        // Act
        const res = await http().get('/subjects').set(auth(forged));

        // Assert
        Should(res.status).Be(401);
      });
    });

    describe('Performance', () => {
      it('responde en menos de 300ms con 1000 asignaturas', async () => {
        // Arrange
        subjectRepository.findBy.mockResolvedValue(manySubjects(1000));

        // Act
        const start = Date.now();
        const res = await http().get('/subjects').set(auth(tokenUserA));
        const elapsedMs = Date.now() - start;

        // Assert
        Should(res.body.data).HaveCount(1000);
        Should(elapsedMs).BeLessThan(300);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('F08 Consultar detalle de una asignatura (GET /subjects/:id)', () => {
    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().get('/subjects/10');

        // Assert
        Should(res.status).Be(401);
      });

      it('asignatura existente -> 200 con sus datos', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        // Act
        const res = await http().get('/subjects/10').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.data.name).Be('Calculo');
        Should(res.body.data.credits).Be(4);
      });

      it('asignatura inexistente -> 404', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(null);

        // Act
        const res = await http().get('/subjects/99999').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(404);
      });

      it('id no numerico -> 400', async () => {
        // Act
        const res = await http().get('/subjects/abc').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(400);
      });
    });

    describe('Seguridad', () => {
      it('un id con intento de inyeccion SQL se rechaza con 400 sin tocar la BD', async () => {
        // Act
        const res = await http()
          .get(`/subjects/${encodeURIComponent('1 OR 1=1')}`)
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.findOneBy).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): getSubjectById/remove/editSubject no verifican que la
      // asignatura pertenezca al usuario del token. Hoy el usuario B puede ver la de A.
      // `it.failing` pasa mientras el bug exista y avisara cuando se corrija.
      it.failing('el usuario B no deberia ver la asignatura del usuario A (esperado 403/404)', async () => {
        // Arrange
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        // Act
        const res = await http().get('/subjects/10').set(auth(tokenUserB));

        // Assert
        Should([403, 404]).Contain(res.status);
      });
    });

    describe('Performance', () => {
      it('50 consultas de detalle secuenciales en menos de 1500ms', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);

        // Act
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          const res = await http().get('/subjects/10').set(auth(tokenUserA));
          Should(res.status).Be(200);
        }
        const elapsedMs = Date.now() - start;

        // Assert
        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('F09 Registrar asignatura (POST /subjects)', () => {
    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().post('/subjects').send(validNewSubject);

        // Assert
        Should(res.status).Be(401);
      });

      it('payload valido -> 201', async () => {
        // Arrange
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send(validNewSubject);

        // Assert
        Should(res.status).Be(201);
        Should(res.body.message).Be('Subject created successfully');
      });

      it('solo con nombre y profesor (color y creditos opcionales) -> 201 con 3 creditos por defecto', async () => {
        // Arrange
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send({ name: 'Algebra', professor: 'Luis Diaz' });

        // Assert
        Should(res.status).Be(201);
        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ credits: 3 }),
        );
      });

      it.each([
        ['sin nombre', { professor: 'Ana' }],
        ['sin profesor', { name: 'Algebra' }],
        ['nombre vacio', { name: '', professor: 'Ana' }],
        ['profesor vacio', { name: 'Algebra', professor: '' }],
      ])('payload invalido (%s) -> 400', async (_caso, payload) => {
        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send(payload);

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it.each([0, 13, 3.5, '3', -1])(
        'creditos fuera de rango o no enteros (%p) -> 400',
        async (credits) => {
          // Act
          const res = await http()
            .post('/subjects')
            .set(auth(tokenUserA))
            .send({ ...validNewSubject, credits });

          // Assert
          Should(res.status).Be(400);
          Should(subjectRepository.save).NotHaveBeenCalled();
        },
      );
    });

    describe('Seguridad', () => {
      it('rechaza campos no permitidos en el payload (whitelist) -> 400', async () => {
        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send({ ...validNewSubject, campoMalicioso: 'hack' });

        // Assert
        Should(res.status).Be(400);
      });

      it('no permite asignar la asignatura a otro usuario desde el body', async () => {
        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send({ ...validNewSubject, user: { id: userB.id } });

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it('la asignatura creada queda asociada al usuario del token', async () => {
        // Arrange
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        // Act
        await http().post('/subjects').set(auth(tokenUserA)).send(validNewSubject);

        // Assert
        Should(userService.findOneById).HaveBeenCalledWith(userA.id);
        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ user: userA }),
        );
      });

      it('un nombre con HTML se guarda como texto, sin interpretarlo', async () => {
        // Arrange
        const xss = '<script>alert(1)</script>';
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        // Act
        const res = await http()
          .post('/subjects')
          .set(auth(tokenUserA))
          .send({ ...validNewSubject, name: xss });

        // Assert
        Should(res.status).Be(201);
        Should(subjectRepository.create).HaveBeenCalledWith(
          expect.objectContaining({ name: xss }),
        );
      });
    });

    describe('Performance', () => {
      it('50 registros secuenciales en menos de 1500ms', async () => {
        // Arrange
        subjectRepository.create.mockReturnValue(mockSubject);
        subjectRepository.save.mockResolvedValue(mockSubject);

        // Act
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          const res = await http()
            .post('/subjects')
            .set(auth(tokenUserA))
            .send(validNewSubject);
          Should(res.status).Be(201);
        }
        const elapsedMs = Date.now() - start;

        // Assert
        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('F10 Editar asignatura (PATCH /subjects/:id)', () => {
    const validEdit = { name: 'Calculo Integral', professor: 'Sofia Mora' };

    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().patch('/subjects/10').send(validEdit);

        // Assert
        Should(res.status).Be(401);
      });

      it('payload valido -> 200', async () => {
        // Arrange
        subjectRepository.preload.mockResolvedValue({
          ...mockSubject,
          ...validEdit,
        });
        subjectRepository.save.mockResolvedValue({});

        // Act
        const res = await http()
          .patch('/subjects/10')
          .set(auth(tokenUserA))
          .send(validEdit);

        // Assert
        Should(res.status).Be(200);
        Should(res.body.message).Be('Subject updated successfully');
      });

      it('asignatura inexistente -> 404', async () => {
        // Arrange
        subjectRepository.preload.mockResolvedValue(undefined);

        // Act
        const res = await http()
          .patch('/subjects/99999')
          .set(auth(tokenUserA))
          .send(validEdit);

        // Assert
        Should(res.status).Be(404);
        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it.each([0, 13, 3.5])('creditos invalidos (%p) -> 400', async (credits) => {
        // Act
        const res = await http()
          .patch('/subjects/10')
          .set(auth(tokenUserA))
          .send({ credits });

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      it('id no numerico -> 400', async () => {
        // Act
        const res = await http()
          .patch('/subjects/abc')
          .set(auth(tokenUserA))
          .send(validEdit);

        // Assert
        Should(res.status).Be(400);
      });
    });

    describe('Seguridad', () => {
      it('rechaza campos no permitidos (whitelist) -> 400', async () => {
        // Act
        const res = await http()
          .patch('/subjects/10')
          .set(auth(tokenUserA))
          .send({ ...validEdit, campoMalicioso: 'hack' });

        // Assert
        Should(res.status).Be(400);
      });

      it('no permite cambiar el dueño de la asignatura desde el body', async () => {
        // Act
        const res = await http()
          .patch('/subjects/10')
          .set(auth(tokenUserA))
          .send({ user: { id: userB.id } });

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.save).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): ver nota en F08. Hoy el usuario B puede editar la de A.
      it.failing('el usuario B no deberia editar la asignatura del usuario A (esperado 403/404)', async () => {
        // Arrange
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.preload.mockResolvedValue({ ...mockSubject, ...validEdit });
        subjectRepository.save.mockResolvedValue({});

        // Act
        const res = await http()
          .patch('/subjects/10')
          .set(auth(tokenUserB))
          .send(validEdit);

        // Assert
        Should([403, 404]).Contain(res.status);
      });
    });

    describe('Performance', () => {
      it('50 ediciones secuenciales en menos de 1500ms', async () => {
        // Arrange
        subjectRepository.preload.mockResolvedValue({ ...mockSubject, ...validEdit });
        subjectRepository.save.mockResolvedValue({});

        // Act
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          const res = await http()
            .patch('/subjects/10')
            .set(auth(tokenUserA))
            .send(validEdit);
          Should(res.status).Be(200);
        }
        const elapsedMs = Date.now() - start;

        // Assert
        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('F11 Eliminar asignatura (DELETE /subjects/:id)', () => {
    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().delete('/subjects/10');

        // Assert
        Should(res.status).Be(401);
      });

      it('asignatura existente -> 200 y se elimina', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({});

        // Act
        const res = await http().delete('/subjects/10').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.message).Be('Subject deleted successfully');
        Should(subjectRepository.delete).HaveBeenCalledWith(10);
      });

      it('asignatura inexistente -> 404 y no elimina nada', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(null);

        // Act
        const res = await http().delete('/subjects/99999').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(404);
        Should(subjectRepository.delete).NotHaveBeenCalled();
      });

      it('id no numerico -> 400', async () => {
        // Act
        const res = await http().delete('/subjects/abc').set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.delete).NotHaveBeenCalled();
      });
    });

    describe('Seguridad', () => {
      it('un id con intento de inyeccion SQL se rechaza con 400 sin eliminar', async () => {
        // Act
        const res = await http()
          .delete(`/subjects/${encodeURIComponent('10; DROP TABLE subject')}`)
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(400);
        Should(subjectRepository.delete).NotHaveBeenCalled();
      });

      // BUG CONOCIDO (IDOR): ver nota en F08. Hoy el usuario B puede eliminar la de A.
      it.failing('el usuario B no deberia eliminar la asignatura del usuario A (esperado 403/404)', async () => {
        // Arrange
        userService.findOneById.mockResolvedValue(userB);
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({});

        // Act
        const res = await http().delete('/subjects/10').set(auth(tokenUserB));

        // Assert
        Should([403, 404]).Contain(res.status);
      });
    });

    describe('Performance', () => {
      it('50 eliminaciones secuenciales en menos de 1500ms', async () => {
        // Arrange
        subjectRepository.findOneBy.mockResolvedValue(mockSubject);
        subjectRepository.delete.mockResolvedValue({});

        // Act
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          const res = await http().delete('/subjects/10').set(auth(tokenUserA));
          Should(res.status).Be(200);
        }
        const elapsedMs = Date.now() - start;

        // Assert
        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Buscar asignaturas (GET /subjects/search?q=)', () => {
    describe('API', () => {
      it('sin token -> 401', async () => {
        // Act
        const res = await http().get('/subjects/search?q=calculo');

        // Assert
        Should(res.status).Be(401);
      });

      it('con coincidencias -> 200 y las asignaturas encontradas', async () => {
        // Act
        const res = await http()
          .get('/subjects/search?q=calculo')
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.data).HaveCount(1);
        Should(res.body.data[0].name).Be('Calculo');
      });

      it('sin coincidencias -> 200 con arreglo vacio', async () => {
        // Arrange
        queryBuilder.getMany.mockResolvedValue([]);

        // Act
        const res = await http()
          .get('/subjects/search?q=quimica')
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(200);
        Should(res.body.data).BeEmpty();
      });

      it.each(['/subjects/search', '/subjects/search?q=', '/subjects/search?q=%20%20'])(
        'termino vacio o en blanco (%s) -> 200 con arreglo vacio sin consultar la BD',
        async (url) => {
          // Act
          const res = await http().get(url).set(auth(tokenUserA));

          // Assert
          Should(res.status).Be(200);
          Should(res.body.data).BeEmpty();
          Should(subjectRepository.createQueryBuilder).NotHaveBeenCalled();
        },
      );

      it('la ruta /search no se confunde con /:id (no responde 400 por id invalido)', async () => {
        // Act
        const res = await http()
          .get('/subjects/search?q=calculo')
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).NotBe(400);
      });
    });

    describe('Seguridad', () => {
      it('filtra siempre por el usuario del token', async () => {
        // Act
        await http().get('/subjects/search?q=calculo').set(auth(tokenUserB));

        // Assert
        Should(queryBuilder.where).HaveBeenCalledWith('user.id = :userId', {
          userId: userB.id,
        });
      });

      it('el termino viaja como parametro enlazado: una inyeccion SQL no altera la consulta', async () => {
        // Arrange
        const injection = "' OR 1=1 --";

        // Act
        await http()
          .get(`/subjects/search?q=${encodeURIComponent(injection)}`)
          .set(auth(tokenUserA));

        // Assert
        Should(queryBuilder.andWhere).HaveBeenCalledWith(
          '(subject.name LIKE :term OR subject.professor LIKE :term)',
          { term: `%${injection}%` },
        );
      });

      it('usuario inexistente en BD -> 404', async () => {
        // Arrange
        userService.findOneById.mockResolvedValue(null);

        // Act
        const res = await http()
          .get('/subjects/search?q=calculo')
          .set(auth(tokenUserA));

        // Assert
        Should(res.status).Be(404);
      });
    });

    describe('Performance', () => {
      it('responde en menos de 300ms con 1000 coincidencias', async () => {
        // Arrange
        queryBuilder.getMany.mockResolvedValue(manySubjects(1000));

        // Act
        const start = Date.now();
        const res = await http()
          .get('/subjects/search?q=materia')
          .set(auth(tokenUserA));
        const elapsedMs = Date.now() - start;

        // Assert
        Should(res.body.data).HaveCount(1000);
        Should(elapsedMs).BeLessThan(300);
      });

      it('50 busquedas secuenciales en menos de 1500ms', async () => {
        // Act
        const start = Date.now();
        for (let i = 0; i < 50; i++) {
          const res = await http()
            .get('/subjects/search?q=calculo')
            .set(auth(tokenUserA));
          Should(res.status).Be(200);
        }
        const elapsedMs = Date.now() - start;

        // Assert
        Should(elapsedMs).BeLessThan(1500);
      });
    });
  });
});
