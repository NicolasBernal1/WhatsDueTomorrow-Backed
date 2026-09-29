import { Test, TestingModule } from '@nestjs/testing';
import * as chai from 'chai';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy';

const chaiExpect = chai.expect;


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
    chaiExpect(strategy).to.exist;
  });

  it('P (token válido): should return { sub, email } from the decoded payload', async () => {
    const payload = { sub: 1, email: 'test@example.com' };

    const result = await strategy.validate(payload);

    chaiExpect(result).to.deep.equal({ sub: 1, email: 'test@example.com' });
  });
});