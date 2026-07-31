import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.repository';

describe('AuthController', () => {
  let controller: AuthController;
  let loginMock: jest.Mock;
  let registerMock: jest.Mock;

  beforeEach(async () => {
    loginMock = jest.fn();
    registerMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: loginMock,
            register: registerMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with request user', () => {
      const user: User = {
        id: 7,
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword: 'stored-hash',
        hashedSalt: 'stored-salt',
      };
      loginMock.mockReturnValue({ access_token: 'signed-token' });

      const result = controller.login({ user });

      expect(loginMock).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      registerMock.mockResolvedValue({ access_token: 'signed-token' });

      const result = await controller.register({
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        password: 'password123',
      });

      expect(registerMock).toHaveBeenCalledWith({
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        password: 'password123',
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('status', () => {
    it('should return authenticated user from request', () => {
      const user: User = {
        id: 7,
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword: 'stored-hash',
        hashedSalt: 'stored-salt',
      };
      const req = { user } as Request;

      const result = controller.status(req);

      expect(result).toEqual(user);
    });
  });
});
