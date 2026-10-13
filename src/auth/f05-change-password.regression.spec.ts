import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Should } from '../common/fluent-assertions';

jest.mock('bcrypt');

describe('F05 Regression Suite: Verificar y Cambiar Contraseña (Backend)', () => {
  let service: AuthService;

  const mockUsersService = {
    findOneById: jest.fn(),
    save: jest.fn(),
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

  describe('Invariante de Regresión 1: Autenticación consistente entre ambos flujos', () => {
    it('ambos métodos deben rechazar con NotFoundException si el usuario no existe', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);

      await Should(() =>
        service.verifyPassword(mockUser.id, 'cualquiera'),
      ).ThrowAsync(NotFoundException);

      await Should(() =>
        service.changePassword(mockUser.id, {
          currentPassword: 'cualquiera',
          newPassword: 'Nueva123',
        }),
      ).ThrowAsync(NotFoundException);

      Should(mockUsersService.save).NotHaveBeenCalled();
    });

    it('ambos métodos deben rechazar con UnauthorizedException si la contraseña actual no coincide', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await Should(() =>
        service.verifyPassword(mockUser.id, 'incorrecta'),
      ).ThrowAsync(UnauthorizedException);

      await Should(() =>
        service.changePassword(mockUser.id, {
          currentPassword: 'incorrecta',
          newPassword: 'Nueva123',
        }),
      ).ThrowAsync(UnauthorizedException);

      Should(mockUsersService.save).NotHaveBeenCalled();
    });
  });

  describe('Invariante de Regresión 2: Re-hasheo obligatorio de la nueva contraseña', () => {
    it('nunca debe llamar a save() con la contraseña nueva en texto plano', async () => {
      mockUsersService.findOneById.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockUsersService.save.mockResolvedValue(mockUser);

      await service.changePassword(mockUser.id, {
        currentPassword: 'correcta123',
        newPassword: 'Nueva123',
      });

      const savedUser = mockUsersService.save.mock.calls[0][0];
      savedUser.password.Should().NotBe('Nueva123');
      savedUser.password.Should().Be('new_hashed_password');
      Should(bcrypt.hash).HaveBeenCalledWith('Nueva123', 10);
    });
  });


  describe('Invariante de Regresión 3: verifyPassword no debe tener efectos secundarios', () => {
    it('nunca debe llamar a save() al verificar una contraseña, exitosa o no', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword(mockUser.id, 'correcta123');

      result.status.Should().Be(200);
      Should(mockUsersService.save).NotHaveBeenCalled();
    });
  });
});