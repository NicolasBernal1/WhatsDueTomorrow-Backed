import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Should } from '../common/fluent-assertions';


jest.mock('bcrypt');

describe('F02 Regression Suite: Iniciar Sesión (Backend)', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUser = {
    id: 7,
    name: 'Ana García',
    email: 'ana@example.com',
    password: 'hashed_password',
  };

  const loginDto = { email: mockUser.email, password: 'plain_password' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });


  describe('Invariante de Regresión 1: Orden estricto de verificación', () => {
    it('debe verificar primero la existencia del usuario (404) antes de comparar contraseña', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await Should(() => service.login(loginDto)).ThrowAsync(
        NotFoundException,
      );

      Should(bcrypt.compare).NotHaveBeenCalled();
    });
  });


  describe('Invariante de Regresión 2: Ninguna emisión de token ante credenciales inválidas', () => {
    it('debe lanzar UnauthorizedException y NUNCA llamar a signAsync si la contraseña no coincide', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await Should(() => service.login(loginDto)).ThrowAsync(
        UnauthorizedException,
      );

      Should(mockJwtService.signAsync).NotHaveBeenCalled();
    });
  });


  describe('Invariante de Regresión 3: Contrato del payload JWT', () => {
    it('debe firmar el token únicamente con { sub, email }, sin filtrar el password hasheado', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('signed_token');

      const result = await service.login(loginDto);

      const signedPayload = mockJwtService.signAsync.mock.calls[0][0];
      signedPayload.Should().BeEquivalentTo({ sub: mockUser.id, email: mockUser.email });
      Should((signedPayload as any).password).BeUndefined();
      result.status.Should().Be(200);
      result.data!.token.Should().Be('signed_token');
    });
  });
});