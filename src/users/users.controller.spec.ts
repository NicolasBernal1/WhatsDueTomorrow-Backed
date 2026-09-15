import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const usersServiceMock = {
      getProfile: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('profile', () => {
    it('should call usersService.getProfile with req.user.email', async () => {
      const req = { user: { email: 'user@example.com' } };
      const expected = {
        status: 200,
        message: 'ok',
        data: { id: 1, email: 'user@example.com', name: 'User' },
      };
      usersService.getProfile.mockResolvedValue(expected as any);

      const result = await controller.profile(req);

      expect(usersService.getProfile).toHaveBeenCalledWith('user@example.com');
      expect(result).toBe(expected);
    });
  });

  describe('deleteAccount', () => {
    it('should call usersService.remove with req.user.sub', async () => {
      const req = { user: { sub: 1 } };
      const expected = { status: 200, message: 'Account deleted', data: null };
      usersService.remove.mockResolvedValue(expected as any);

      const result = await controller.deleteAccount(req);

      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
