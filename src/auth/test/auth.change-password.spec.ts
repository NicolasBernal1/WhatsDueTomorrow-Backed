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
  save: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService · changePassword', () => {
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
  const changePasswordDto = { currentPassword: 'correcta123', newPassword: 'Nueva123' };

  it('P2 (1-2-3(Sí)-5-6(No)-7): should throw NotFoundException if the user does not exist', async () => {
    mockUsersService.findOneById.mockResolvedValue(null);

    await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(NotFoundException);
    expect(mockUsersService.save).not.toHaveBeenCalled();
  });

  it('P3 (1-2-3(Sí)-5-6(Sí)-8-9(No)-10): should throw UnauthorizedException if the current password is incorrect', async () => {
    mockUsersService.findOneById.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException);
    expect(mockUsersService.save).not.toHaveBeenCalled();
  });

  it('P4 (1-2-3(Sí)-5-6(Sí)-8-9(Sí)-11-12-13): should hash the new password, save the user and return status 200', async () => {
    mockUsersService.findOneById.mockResolvedValue({ ...mockUser });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
    mockUsersService.save.mockResolvedValue(mockUser);

    const result = await service.changePassword(userId, changePasswordDto);

    expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordDto.currentPassword, mockUser.password);
    expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
    expect(mockUsersService.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'new_hashed_password' })
    );
    expect(result.status).toBe(200);
    expect(result.message).toBe('Password updated successfully');
  });
});
