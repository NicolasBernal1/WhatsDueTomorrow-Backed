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
// INICIAR SESIÓN — POST /auth/login
// Tabla de caminos BE-2 · nodos 1-9 · 2 decisiones (nodos 3, 6) · V(G) = 3
// ════════════════════════════════════════════════════════════════════════════
jest.mock('bcrypt');

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · login', () => {
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

  const loginDto = { email: 'test@example.com', password: 'plain_password' };

  it('P1 (1-2-3(No)-4): should throw NotFoundException if the user does not exist', async () => {
    // Arrange
    mockUsersService.findOneByEmail.mockResolvedValue(null);

    // Act & Assert
    await chaiExpect(service.login(loginDto)).to.be.rejectedWith(
      NotFoundException,
    );
  });

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw UnauthorizedException if the password is incorrect', async () => {
    // Arrange
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await chaiExpect(service.login(loginDto)).to.be.rejectedWith(
      UnauthorizedException,
    );
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9): should return a token and user data on successful login', async () => {
    // Arrange
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('signed_token');

    // Act
    const result = await service.login(loginDto);

    // Assert
    chaiExpect(result.status).to.equal(200);
    chaiExpect(result.data?.token).to.equal('signed_token');
    chaiExpect(result.data?.user).to.deep.include({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });
});