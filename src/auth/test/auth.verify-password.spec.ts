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
// VERIFICAR CONTRASEÑA (paso previo a Cambiar Contraseña en el frontend)
// PATCH /auth/verify-password
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
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · verifyPassword', () => {
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
  const password = 'plain_password';

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw NotFoundException if the user does not exist', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue(null);

    // Act & Assert
    await chaiExpect(
      service.verifyPassword(userId, password),
    ).to.be.rejectedWith(NotFoundException);
    expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9(No)-10): should throw UnauthorizedException if the password is incorrect', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await chaiExpect(
      service.verifyPassword(userId, password),
    ).to.be.rejectedWith(UnauthorizedException);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
  });

  it('P4 (1-2-3(Sí)-5-6(Sí)-8-9(Sí)-11): should return status 200 when the password is correct', async () => {
    // Arrange
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await service.verifyPassword(userId, password);

    // Assert
    chaiExpect(result.status).to.equal(200);
    chaiExpect(result.message).to.equal('Password verified successfully');
  });
});