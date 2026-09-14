import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      changePassword: jest.fn(),
      verifyPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the DTO and return its result', async () => {
      const userDto = { name: 'Ana', email: 'ana@test.com', password: 'Clave123' };
      const expected = {
        status: 201,
        message: 'User registered successfully',
        data: { id: 1, name: 'Ana', email: 'ana@test.com' },
      };
      authService.register.mockResolvedValue(expected as any);

      const result = await controller.register(userDto as any);

      expect(authService.register).toHaveBeenCalledWith(userDto);
      expect(result).toBe(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with the DTO and return its result', async () => {
      const loginDto = { email: 'ana@test.com', password: 'Clave123' };
      const expected = {
        status: 200,
        message: 'Logged in successfully',
        data: { token: 'tok', user: { id: 1, name: 'Ana', email: 'ana@test.com' } },
      };
      authService.login.mockResolvedValue(expected as any);

      const result = await controller.login(loginDto as any);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(expected);
    });
  });

  describe('changePassword', () => {
    it('should extract userId from req.user.sub and call authService.changePassword', async () => {
      const req = { user: { sub: 1, email: 'ana@test.com' } };
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const expected = { status: 200, message: 'Password updated successfully' };
      authService.changePassword.mockResolvedValue(expected as any);

      const result = await controller.changePassword(req, dto as any);

      expect(authService.changePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('verifyPassword', () => {
    it('should extract userId from req.user.sub and call authService.verifyPassword with the password string', async () => {
      const req = { user: { sub: 1, email: 'ana@test.com' } };
      const dto = { password: 'Clave123' };
      const expected = { status: 200, message: 'Password verified successfully' };
      authService.verifyPassword.mockResolvedValue(expected as any);

      const result = await controller.verifyPassword(req, dto as any);

      expect(authService.verifyPassword).toHaveBeenCalledWith(1, 'Clave123');
      expect(result).toBe(expected);
    });
  });
});