import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Should } from '../common/fluent-assertions';


describe('F04 Regression Suite: Consultar Perfil (Backend)', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserRepo = {
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser = {
    id: 7,
    name: 'Ana García',
    email: 'ana@example.com',
    password: 'hashed_password',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });


  describe('Invariante de Regresión 1: El perfil nunca expone la contraseña', () => {
    it('debe devolver solo id/name/email, sin el campo password del hash almacenado', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      const result = await controller.profile({ user: { email: mockUser.email } });

      result.status.Should().Be(200);
      Should((result.data as any).password).BeUndefined();
      result.data!.email.Should().Be(mockUser.email);
    });
  });


  describe('Invariante de Regresión 2: Identidad de lectura por email', () => {
    it('debe consultar el repositorio por email, no por id, al leer el perfil', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      await controller.profile({ user: { email: mockUser.email } });

      Should(mockUserRepo.findOneBy).HaveBeenCalledWith({ email: mockUser.email });
    });

    it('debe lanzar NotFoundException si el email del token no corresponde a ningún usuario', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      await Should(() =>
        service.getProfile('inexistente@example.com'),
      ).ThrowAsync(NotFoundException);
    });
  });

  describe('Invariante de Regresión 3: Identidad de borrado por sub (id)', () => {
    it('debe consultar y eliminar por id (req.user.sub), no por email', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteAccount({ user: { sub: mockUser.id } });

      Should(mockUserRepo.findOneBy).HaveBeenCalledWith({ id: mockUser.id });
      Should(mockUserRepo.delete).HaveBeenCalledWith(mockUser.id);
      result.status.Should().Be(204);
    });
  });
});