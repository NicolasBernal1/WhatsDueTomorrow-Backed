import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · login', () => {
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

  const loginDto = { email: 'test@example.com', password: 'plain_password' };

  it('P1 (1-2-3(No)-4): should throw NotFoundException if the user does not exist', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(null);

    await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
  });

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw UnauthorizedException if the password is incorrect', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9): should return a token and user data on successful login', async () => {
    mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('signed_token');

    const result = await service.login(loginDto);

    expect(result.status).toBe(200);
    expect(result.data?.token).toBe('signed_token');
    expect(result.data?.user).toMatchObject({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
  });
});
