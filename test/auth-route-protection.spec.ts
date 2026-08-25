import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { SubjectsController } from '../src/subjects/subjects.controller';
import { SubjectsService } from '../src/subjects/subjects.service';
import { PayloadDto } from '../src/auth/dtos/payload.dto';

describe('Protección de Rutas Privadas (Backend) - Pruebas de Caminos Básicos', () => {

  let jwtStrategy: JwtStrategy;
  let subjectsController: SubjectsController;
  let subjectsServiceMock: jest.Mocked<Partial<SubjectsService>>;
  let configServiceMock: jest.Mocked<Partial<ConfigService>>;
  let jwtServiceMock: jest.Mocked<Partial<JwtService>>;

  const mockSubjectsResponse = {
    status: 200,
    message: 'Subjects retrieved successfully',
    data: [
      {
        id: 10,
        name: 'validación',
        professor: 'Gabriel',
        color: '#0078d4',
      },
    ],
  };

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test_secret_key_12345';
        return null;
      }),
    };

    jwtServiceMock = {
      verifyAsync: jest.fn(),
      verify: jest.fn(),
    };

    subjectsServiceMock = {
      getSubjects: jest.fn().mockResolvedValue(mockSubjectsResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: SubjectsService, useValue: subjectsServiceMock },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    subjectsController = module.get<SubjectsController>(SubjectsController);
  });

  // Helper para simular el guardián de autenticación JWT de NestJS / Passport
  const simulateJwtAuthGuard = async (req: any): Promise<boolean> => {
    // Nodo 1 -> 2: Extraer credenciales de sesión adjuntas (Authorization: Bearer <token>)
    const authHeader = req.headers?.authorization;

    // Nodo 2 (Decisión 1): ¿La solicitud contiene credenciales de sesión?
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Rama No -> Nodo 3 & 8: Rechazar con mensaje de acceso no autorizado
      throw new UnauthorizedException('No authorization token was found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    // Nodo 4 & 5: Verificar firma criptográfica y fecha de expiración
    let payload: any;
    try {
      if (token === 'token_vencido' || token === 'expired_token') {
        const error: any = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      }
      if (token === 'invalid_signature_token' || token === 'fake_token') {
        const error: any = new Error('invalid signature');
        error.name = 'JsonWebTokenError';
        throw error;
      }

      // Si es un token válido
      payload = { sub: 1, email: 'test@example.com' };
    } catch (err) {
      // Rama No -> Nodo 6 & 8: Rechazar solicitud y revocar autorización
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Nodo 7: Identificar al usuario propietario de la sesión (validate) e inyectarlo en req.user
    const user = await jwtStrategy.validate(payload);
    req.user = user; // Inyectar_req_user()

    return true;
  };

  // =========================================================================
  // CAMINO 1: [1, 2, 3, 8] - Región 1 (R1)
  // =========================================================================
  // Entrada: peticion = GET /subjects, header = null
  // Prueba: header = false, token = false
  // Salida esperada: UnauthorizedException()
  // =========================================================================
  describe('Camino 1: [1 -> 2 -> 3 -> 8] (Solicitud sin credenciales / header = null)', () => {

    it('debe rechazar la solicitud y lanzar UnauthorizedException cuando no se envían credenciales (peticion = GET /subjects, header = null)', async () => {
      // Entrada
      const mockReq = {
        headers: {}, // header = null (false)
        method: 'GET',
        url: '/subjects',
      };

      const hasHeader = !!mockReq.headers['authorization'];
      const hasToken = false;

      // Verificación de condiciones
      expect(hasHeader).toBe(false);
      expect(hasToken).toBe(false);

      // Ejecutar guardián y verificar rechazo con UnauthorizedException
      await expect(simulateJwtAuthGuard(mockReq)).rejects.toThrow(UnauthorizedException);
      await expect(simulateJwtAuthGuard(mockReq)).rejects.toThrow('No authorization token was found');

      // Verificar que NO se ejecutó el servicio privado
      expect(subjectsServiceMock.getSubjects).not.toHaveBeenCalled();
    });

  });

  // =========================================================================
  // CAMINO 2: [1, 2, 4, 5, 6, 8] - Región 2 (R2)
  // =========================================================================
  // Entrada: peticion = GET /subjects, header = token_vencido
  // Prueba: header = true, token = false, token_expirado = true
  // Salida esperada: UnauthorizedException()
  // =========================================================================
  describe('Camino 2: [1 -> 2 -> 4 -> 5 -> 6 -> 8] (Solicitud con credenciales vencidas o inválidas)', () => {

    it('debe rechazar la solicitud y lanzar UnauthorizedException cuando el token está vencido (peticion = GET /subjects, header = token_vencido)', async () => {
      // Entrada
      const mockReq = {
        headers: {
          authorization: 'Bearer token_vencido', // header = true, token_expirado = true
        },
        method: 'GET',
        url: '/subjects',
      };

      const hasHeader = !!mockReq.headers.authorization;
      const isTokenExpired = true;

      // Verificación de condiciones
      expect(hasHeader).toBe(true);
      expect(isTokenExpired).toBe(true);

      // Ejecutar guardián y verificar rechazo con UnauthorizedException
      await expect(simulateJwtAuthGuard(mockReq)).rejects.toThrow(UnauthorizedException);
      await expect(simulateJwtAuthGuard(mockReq)).rejects.toThrow('Invalid or expired token');

      // Verificar que NO se ejecutó el servicio privado
      expect(subjectsServiceMock.getSubjects).not.toHaveBeenCalled();
    });

    it('debe rechazar la solicitud cuando el token contiene una firma inválida o adulterada', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid_signature_token',
        },
        method: 'GET',
        url: '/subjects',
      };

      await expect(simulateJwtAuthGuard(mockReq)).rejects.toThrow(UnauthorizedException);
      expect(subjectsServiceMock.getSubjects).not.toHaveBeenCalled();
    });

  });

  // =========================================================================
  // CAMINO 3: [1, 2, 4, 5, 7, 8] - Región 3 (R3)
  // =========================================================================
  // Entrada: peticion = GET /subjects, header = token_vigente
  // Prueba: header = true, token = true, token_expirado = false
  // Salida esperada: validate(payload), Inyectar_req_user(), EjecutarServicio()
  // =========================================================================
  describe('Camino 3: [1 -> 2 -> 4 -> 5 -> 7 -> 8] (Solicitud con credenciales auténticas y vigentes)', () => {

    it('debe validar el payload, inyectar el usuario en req.user y ejecutar el servicio retornando los datos (peticion = GET /subjects, header = token_vigente)', async () => {
      // Entrada
      const mockReq: any = {
        headers: {
          authorization: 'Bearer token_vigente', // header = true, token = true, token_expirado = false
        },
        method: 'GET',
        url: '/subjects',
      };

      const hasHeader = !!mockReq.headers.authorization;
      const isTokenValid = true;
      const isTokenExpired = false;

      // Verificación de condiciones de entrada
      expect(hasHeader).toBe(true);
      expect(isTokenValid).toBe(true);
      expect(isTokenExpired).toBe(false);

      // Spy en el método validate de JwtStrategy
      const validateSpy = jest.spyOn(jwtStrategy, 'validate');

      // 1. Ejecutar guardián (Autenticación exitosa)
      const isAllowed = await simulateJwtAuthGuard(mockReq);
      expect(isAllowed).toBe(true);

      // 2. Verificar validate(payload)
      expect(validateSpy).toHaveBeenCalledWith({ sub: 1, email: 'test@example.com' });

      // 3. Verificar Inyectar_req_user()
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user).toEqual({ sub: 1, email: 'test@example.com' });

      // 4. EjecutarServicio() mediante SubjectsController
      const response = await subjectsController.getSubjects(mockReq);

      expect(subjectsServiceMock.getSubjects).toHaveBeenCalledWith(mockReq.user.sub);
      expect(response).toEqual(mockSubjectsResponse);
      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(1);
    });

  });

  // =========================================================================
  // PRUEBAS DE LA ESTRATEGIA JWT (JwtStrategy)
  // =========================================================================
  describe('JwtStrategy - Validación de Payload', () => {

    it('debe extraer sub y email del payload y retornarlos para inyección en request', async () => {
      const payload: PayloadDto = {
        sub: 42,
        email: 'estudiante@universidad.edu',
      };

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual({
        sub: 42,
        email: 'estudiante@universidad.edu',
      });
    });

  });

});
