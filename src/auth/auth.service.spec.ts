import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userNameIsAvailableMock: jest.Mock;
  let emailIsAvailableMock: jest.Mock;
  let createUserMock: jest.Mock;
  let findByEmailMock: jest.Mock;
  let jwtSignMock: jest.Mock;
  let configGetMock: jest.Mock;
  let genSaltMock: jest.MockedFunction<typeof bcrypt.genSalt>;
  let hashMock: jest.MockedFunction<typeof bcrypt.hash>;
  let compareMock: jest.MockedFunction<typeof bcrypt.compare>;

  beforeEach(async () => {
    jest.clearAllMocks();

    userNameIsAvailableMock = jest.fn();
    emailIsAvailableMock = jest.fn();
    createUserMock = jest.fn();
    findByEmailMock = jest.fn();
    jwtSignMock = jest.fn();
    configGetMock = jest.fn();
    genSaltMock = jest.mocked(bcrypt.genSalt);
    hashMock = jest.mocked(bcrypt.hash);
    compareMock = jest.mocked(bcrypt.compare);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            userNameIsAvailable: userNameIsAvailableMock,
            emailIsAvailable: emailIsAvailableMock,
            create: createUserMock,
            findByEmail: findByEmailMock,
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jwtSignMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: configGetMock,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return access token', async () => {
      const salt = 'salt-value';
      const hashedPassword = 'hashed-password';
      const jwtOptions = { secret: 'jwt-secret', expiresIn: '15m' };
      const payload = { sub: 7, username: 'alice' };

      genSaltMock.mockResolvedValue(salt as never);
      hashMock.mockResolvedValue(hashedPassword as never);
      createUserMock.mockResolvedValue(payload);
      configGetMock.mockReturnValue(jwtOptions);
      jwtSignMock.mockReturnValue('signed-token');

      const result = await service.register(
        'Alice',
        'alice',
        'alice@mail.com',
        'password123',
      );

      expect(userNameIsAvailableMock).toHaveBeenCalledWith('alice');
      expect(emailIsAvailableMock).toHaveBeenCalledWith('alice@mail.com');
      expect(genSaltMock).toHaveBeenCalled();
      expect(hashMock).toHaveBeenCalledWith('password123', salt);
      expect(createUserMock).toHaveBeenCalledWith({
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword,
        hashedSalt: salt,
      });
      expect(configGetMock).toHaveBeenCalledWith('jwt');
      expect(jwtSignMock).toHaveBeenCalledWith(payload, jwtOptions);
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw if username already exists', async () => {
      userNameIsAvailableMock.mockRejectedValue(
        new BadRequestException('Username is occupied'),
      );

      await expect(
        service.register('Alice', 'alice', 'alice@mail.com', 'password123'),
      ).rejects.toThrow(new BadRequestException('Username is occupied'));

      expect(userNameIsAvailableMock).toHaveBeenCalledWith('alice');
      expect(emailIsAvailableMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
      expect(genSaltMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(jwtSignMock).not.toHaveBeenCalled();
    });

    it('should throw if email already exists', async () => {
      emailIsAvailableMock.mockRejectedValue(
        new BadRequestException('Email is occupied'),
      );

      await expect(
        service.register('Alice', 'alice', 'alice@mail.com', 'password123'),
      ).rejects.toThrow(new BadRequestException('Email is occupied'));

      expect(userNameIsAvailableMock).toHaveBeenCalledWith('alice');
      expect(emailIsAvailableMock).toHaveBeenCalledWith('alice@mail.com');
      expect(createUserMock).not.toHaveBeenCalled();
      expect(genSaltMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(jwtSignMock).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException if email does not exist', async () => {
      findByEmailMock.mockResolvedValue(null);

      await expect(
        service.signIn('alice@mail.com', 'password123'),
      ).rejects.toThrow(new UnauthorizedException('Invalid email'));
      expect(findByEmailMock).toHaveBeenCalledWith('alice@mail.com');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      findByEmailMock.mockResolvedValue({
        id: 7,
        userName: 'alice',
        hashedPassword: 'stored-hash',
      });
      compareMock.mockResolvedValue(false as never);

      await expect(
        service.signIn('alice@mail.com', 'wrong-password'),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
      expect(compareMock).toHaveBeenCalledWith('wrong-password', 'stored-hash');
    });

    it('should return access token if credentials are valid', async () => {
      const jwtOptions = { secret: 'jwt-secret', expiresIn: '15m' };

      findByEmailMock.mockResolvedValue({
        id: 7,
        userName: 'alice',
        hashedPassword: 'stored-hash',
      });
      compareMock.mockResolvedValue(true as never);
      configGetMock.mockReturnValue(jwtOptions);
      jwtSignMock.mockReturnValue('signed-token');

      const result = await service.signIn('alice@mail.com', 'password123');

      expect(configGetMock).toHaveBeenCalledWith('jwt');
      expect(jwtSignMock).toHaveBeenCalledWith(
        { sub: 7, username: 'alice' },
        jwtOptions,
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
