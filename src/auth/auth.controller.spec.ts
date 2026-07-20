import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let signInMock: jest.Mock;
  let registerMock: jest.Mock;

  beforeEach(async () => {
    signInMock = jest.fn();
    registerMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: signInMock,
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

  describe('signIn', () => {
    it('should call authService.signIn with dto values', async () => {
      signInMock.mockResolvedValue({ access_token: 'signed-token' });

      const result = await controller.signIn({
        email: 'alice@mail.com',
        password: 'password123',
      });

      expect(signInMock).toHaveBeenCalledWith('alice@mail.com', 'password123');
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('register', () => {
    it('should call authService.register with dto values', async () => {
      registerMock.mockResolvedValue({ access_token: 'signed-token' });

      const result = await controller.register({
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        password: 'password123',
      });

      expect(registerMock).toHaveBeenCalledWith(
        'Alice',
        'alice',
        'alice@mail.com',
        'password123',
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw when user already exists', async () => {
      registerMock.mockRejectedValue(
        new BadRequestException('Username is occupied'),
      );

      await expect(
        controller.register({
          firstName: 'Alice',
          userName: 'alice',
          email: 'alice@mail.com',
          password: 'password123',
        }),
      ).rejects.toThrow(new BadRequestException('Username is occupied'));

      expect(registerMock).toHaveBeenCalledWith(
        'Alice',
        'alice',
        'alice@mail.com',
        'password123',
      );
    });
  });
});
