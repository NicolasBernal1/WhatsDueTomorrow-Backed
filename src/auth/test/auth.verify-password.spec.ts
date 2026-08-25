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
  findOneById: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · verifyPassword', () => {
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

  const userId = 1;
  const password = 'plain_password';

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw NotFoundException if the user does not exist', async () => {
    mockUsersService.findOneById.mockResolvedValue(null);

    await expect(service.verifyPassword(userId, password)).rejects.toThrow(NotFoundException);
    expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9(No)-10): should throw UnauthorizedException if the password is incorrect', async () => {
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.verifyPassword(userId, password)).rejects.toThrow(UnauthorizedException);
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
  });

  it('P4 (1-2-3(Sí)-5-6(Sí)-8-9(Sí)-11): should return status 200 when the password is correct', async () => {
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.verifyPassword(userId, password);

    expect(result.status).toBe(200);
    expect(result.message).toBe('Password verified successfully');
  });
});
