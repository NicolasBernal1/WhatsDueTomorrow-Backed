import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ExistingUserException } from '../exceptions/existing-user.exception';
import * as bcrypt from 'bcrypt';



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
    expect(service).toBeDefined();
  });

  const registerDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'plain_password',
  };

  it('P2 (1-2-3(No)-5-6-7): should register a new user and return status 201', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    mockUsersService.create.mockResolvedValue(mockUser);

    const result = await service.register(registerDto);

    expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    expect(mockUsersService.create).toHaveBeenCalledWith({
      email: registerDto.email,
      name: registerDto.name,
      password: 'hashed_password',
    });
    expect(result.status).toBe(201);
    expect(result.data).toMatchObject({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it('P1 (1-2-3(Sí)-4): should throw ExistingUserException if the email is already in use', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

    await expect(service.register(registerDto)).rejects.toThrow(ExistingUserException);
    expect(mockUsersService.create).not.toHaveBeenCalled();
  });
});
