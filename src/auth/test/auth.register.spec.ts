import { Test, TestingModule } from '@nestjs/testing';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ExistingUserException } from '../exceptions/existing-user.exception';
import * as bcrypt from 'bcrypt';

chai.use(chaiAsPromised);
const chaiExpect = chai.expect;

// ════════════════════════════════════════════════════════════════════════════
// REGISTRAR ESTUDIANTE — POST /auth/register
// Tabla de caminos BE-1
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
  create: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · register', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Arrange (módulo de pruebas de Nest)
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

  const registerDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'plain_password',
  };

  it('P2 (1-2-3(No)-5-6-7): should register a new user and return status 201', async () => {
    // Arrange
    mockUsersService.findOneByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    mockUsersService.create.mockResolvedValue(mockUser);

    // Act
    const result = await service.register(registerDto);

    // Assert
    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
      registerDto.email,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    expect(mockUsersService.create).toHaveBeenCalledWith({
      email: registerDto.email,
      name: registerDto.name,
      password: 'hashed_password',
    });
    chaiExpect(result.status).to.equal(201);
    chaiExpect(result.data).to.deep.include({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it('P1 (1-2-3(Sí)-4): should throw ExistingUserException if the email is already in use', async () => {
    // Arrange
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

    // Act & Assert
    await chaiExpect(service.register(registerDto)).to.be.rejectedWith(
      ExistingUserException,
    );
    expect(mockUsersService.create).not.toHaveBeenCalled();
  });
});