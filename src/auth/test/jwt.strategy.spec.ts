import { Test, TestingModule } from '@nestjs/testing';
import * as chai from 'chai';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy';

const chaiExpect = chai.expect;

// Nota: el camino "token inválido -> 401" de las tablas BE-3, BE-4 y BE-5
// (nodo "Guard JWT" / "¿token válido?") lo resuelve la librería passport-jwt
// ANTES de llamar a validate() (firma inválida o expirado nunca llegan aquí).
// Por eso ese camino no se cubre con un unit test de esta clase; se valida
// con una prueba e2e golpeando un endpoint protegido sin token / con token vencido.

const mockConfigService = {
  get: jest.fn().mockReturnValue('test_secret'),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    // Assert
    chaiExpect(strategy).to.exist;
  });

  it('P (token válido): should return { sub, email } from the decoded payload', async () => {
    // Arrange
    const payload = { sub: 1, email: 'test@example.com' };

    // Act
    const result = await strategy.validate(payload);

    // Assert
    chaiExpect(result).to.deep.equal({ sub: 1, email: 'test@example.com' });
  });
});