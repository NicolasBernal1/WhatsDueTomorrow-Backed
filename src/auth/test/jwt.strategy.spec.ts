import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy';



const mockConfigService = {
  get: jest.fn().mockReturnValue('test_secret'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('P (token válido): should return { sub, email } from the decoded payload', async () => {
    const payload = { sub: 1, email: 'test@example.com' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ sub: 1, email: 'test@example.com' });
  });
});
