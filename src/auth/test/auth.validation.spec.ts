import { validate } from 'class-validator';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto } from '../dtos/login.dto';

describe('Auth DTO validation', () => {
  it('accepts a valid registration name and email', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      name: 'Ana García',
      email: 'ana@example.com',
      password: 'Clave123',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects numbers in registration names', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      name: 'Ana2',
      email: 'ana@example.com',
      password: 'Clave123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });

  it.each(['ana', 'ana@', 'ana@example'])('rejects invalid email: %s', async (email) => {
    const dto = Object.assign(new CreateUserDto(), {
      name: 'Ana',
      email,
      password: 'Clave123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects invalid email during login', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'usuario-invalido',
      password: 'Clave123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });
});