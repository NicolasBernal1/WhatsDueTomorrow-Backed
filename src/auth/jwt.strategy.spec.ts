import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PayloadDto } from './dtos/payload.dto';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('deberia solicitar el secreto JWT_SECRET al ConfigService al construirse', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    it('deberia retornar sub y email a partir del payload decodificado', async () => {
      const payload: PayloadDto = { sub: 1, email: 'user@example.com' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ sub: 1, email: 'user@example.com' });
    });

    it('deberia mapear unicamente sub y email aunque el payload traiga campos extra', async () => {
      const payload = {
        sub: 42,
        email: 'otro@example.com',
        iat: 1710000000,
        exp: 1710003600,
      } as PayloadDto;

      const result = await strategy.validate(payload);

      expect(result).toEqual({ sub: 42, email: 'otro@example.com' });
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });
});