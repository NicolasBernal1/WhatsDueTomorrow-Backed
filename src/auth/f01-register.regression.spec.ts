import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ExistingUserException } from './exceptions/existing-user.exception';
import * as bcrypt from 'bcrypt';
import { Should } from '../common/fluent-assertions';


jest.mock('bcrypt');

describe('F01 Regression Suite: Registrar Estudiante (Backend)', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const registerDto = {
    name: 'Ana García',
    email: 'ana@example.com',
    password: 'Clave123',
  };

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

  describe('Invariante de Regresión 1: Hasheo obligatorio de contraseña', () => {
    it('debe hashear la contraseña con bcrypt (10 salt rounds) antes de llamar a create()', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersService.create.mockResolvedValue({
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed_password',
      });

      await service.register(registerDto);

      Should(bcrypt.hash).HaveBeenCalledWith(registerDto.password, 10);
      const createArg = mockUsersService.create.mock.calls[0][0];
      createArg.password.Should().NotBe(registerDto.password);
      createArg.password.Should().Be('hashed_password');
    });
  });


  describe('Invariante de Regresión 2: Rechazo estricto de correos duplicados', () => {
    it('debe lanzar ExistingUserException y NUNCA llamar a create() si el correo ya existe', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 99,
        email: registerDto.email,
      });

      await Should(() => service.register(registerDto)).ThrowAsync(
        ExistingUserException,
      );

      Should(mockUsersService.create).NotHaveBeenCalled();
    });
  });


  describe('Invariante de Regresión 3: Contrato de respuesta sin datos sensibles', () => {
    it('debe responder 201 con id/name/email únicamente, sin exponer el password', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersService.create.mockResolvedValue({
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed_password',
      });

      const result = await service.register(registerDto);

      result.status.Should().Be(201);
      Should((result.data as any).password).BeUndefined();
      result.data!.email.Should().Be(registerDto.email);
      result.data!.name.Should().Be(registerDto.name);
    });
  });
});