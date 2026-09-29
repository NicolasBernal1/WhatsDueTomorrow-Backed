import { Test, TestingModule } from '@nestjs/testing';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

chai.use(chaiAsPromised);
const chaiExpect = chai.expect;

// ════════════════════════════════════════════════════════════════════════════
// CAMBIAR CONTRASEÑA — PATCH /auth/change-password
// Tabla de caminos BE-5 · nodos 1-13 · decisiones en 3, 6, 9 · V(G) = 4
// El camino P1 (nodo 3, token inválido) lo resuelve el guard JWT antes de
// llegar al servicio, por lo que no es unit-testable aquí — se cubre a nivel
// e2e golpeando el endpoint sin token / con token vencido.
// ════════════════════════════════════════════════════════════════════════════
jest.mock('bcrypt');

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
};

const mockUsersService = {
  findOneById: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · changePassword', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    // Assert
    chaiExpect(service).to.exist;
  });

  const userId = 1;
  const changePasswordDto = {
    currentPassword: 'correcta123',
    newPassword: 'Nueva123',
  };

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw NotFoundException if the user does not exist', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue(null);

    // Act & Assert
    await chaiExpect(
      service.changePassword(userId, changePasswordDto),
    ).to.be.rejectedWith(NotFoundException);
    expect(mockUsersService.save).not.toHaveBeenCalled();
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9(No)-10): should throw UnauthorizedException if the current password is incorrect', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await chaiExpect(
      service.changePassword(userId, changePasswordDto),
    ).to.be.rejectedWith(UnauthorizedException);
    expect(mockUsersService.save).not.toHaveBeenCalled();
  });

  it('P4 (1-2-3(Sí)-5-6(Sí)-8-9(Sí)-11-12-13): should hash the new password, save the user and return status 200', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue({ ...mockUser });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
    mockUsersService.save.mockResolvedValue(mockUser);

    // Act
    const result = await service.changePassword(userId, changePasswordDto);

    // Assert
    expect(bcrypt.compare).toHaveBeenCalledWith(
      changePasswordDto.currentPassword,
      mockUser.password,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
    expect(mockUsersService.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'new_hashed_password' }),
    );
    chaiExpect(result.status).to.equal(200);
    chaiExpect(result.message).to.equal('Password updated successfully');
  });
});