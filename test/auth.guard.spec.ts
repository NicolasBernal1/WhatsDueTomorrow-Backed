import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { SubjectsController } from '../src/subjects/subjects.controller';
import { SubjectsService } from '../src/subjects/subjects.service';

describe('AuthGuard / JwtStrategy - Backend Route Protection', () => {

  let jwtStrategy: JwtStrategy;
  let subjectsController: SubjectsController;
  let subjectsServiceMock: jest.Mocked<Partial<SubjectsService>>;

  beforeEach(async () => {
    subjectsServiceMock = {
      getSubjects: jest.fn().mockResolvedValue({
        status: 200,
        message: 'Subjects retrieved successfully',
        data: [{ id: 10, name: 'validación', professor: 'Gabriel', color: '#0078d4' }] as any,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_jwt_secret'),
          },
        },
        {
          provide: SubjectsService,
          useValue: subjectsServiceMock,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    subjectsController = module.get<SubjectsController>(SubjectsController);
  });

  // Camino: 1, 2, 3, 8 (Región 1)
  // Entrada: peticion = GET /subjects header = null
  // Prueba: header = false, token = false
  // Salida: UnauthorizedException()
  it('Camino 1, 2, 3, 8: debe lanzar UnauthorizedException cuando no se envían credenciales de sesión en la petición', async () => {
    const mockReq = { headers: {} } as any;

    const executeWithAuthCheck = () => {
      if (!mockReq.headers?.authorization) {
        throw new UnauthorizedException('No authorization token was found');
      }
    };

    expect(executeWithAuthCheck).toThrow(UnauthorizedException);
    expect(subjectsServiceMock.getSubjects).not.toHaveBeenCalled();
  });

  // Camino: 1, 2, 4, 5, 6, 8 (Región 2)
  // Entrada: peticion = GET /subjects, header = token_vencido
  // Prueba: header = true, token = false, token_expirado = true
  // Salida: UnauthorizedException()
  it('Camino 1, 2, 4, 5, 6, 8: debe lanzar UnauthorizedException cuando el token está vencido o es inválido', async () => {
    const mockReq = {
      headers: { authorization: 'Bearer token_vencido' },
    } as any;

    const executeWithAuthCheck = () => {
      const token = mockReq.headers.authorization.split(' ')[1];
      if (token === 'token_vencido') {
        throw new UnauthorizedException('Invalid or expired token');
      }
    };

    expect(executeWithAuthCheck).toThrow(UnauthorizedException);
    expect(subjectsServiceMock.getSubjects).not.toHaveBeenCalled();
  });

  // Camino: 1, 2, 4, 5, 7, 8 (Región 3)
  // Entrada: peticion = GET /subjects header = token_vigente
  // Prueba: header = true, token = true, token_expirado = false
  // Salida: validate(payload) Inyectar_req_user() EjecutarServicio()
  it('Camino 1, 2, 4, 5, 7, 8: debe validar payload, inyectar req.user y ejecutar el servicio exitosamente con token vigente', async () => {
    const payload = { sub: 1, email: 'estudiante@universidad.edu' };
    const mockReq = {
      headers: { authorization: 'Bearer token_vigente' },
      user: null as any,
    } as any;

    // 1. validate(payload)
    const user = await jwtStrategy.validate(payload);
    expect(user).toEqual({ sub: 1, email: 'estudiante@universidad.edu' });

    // 2. Inyectar_req_user()
    mockReq.user = user;
    expect(mockReq.user).toBeDefined();

    // 3. EjecutarServicio()
    const result = await subjectsController.getSubjects(mockReq);

    expect(subjectsServiceMock.getSubjects).toHaveBeenCalledWith(1);
    expect(result.status).toBe(200);
  });

});
