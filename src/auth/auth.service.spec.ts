import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.repository';

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
      const createdUserPayload = { id: 7, email: 'alice@mail.com' };

      genSaltMock.mockResolvedValue(salt as never);
      hashMock.mockResolvedValue(hashedPassword as never);
      createUserMock.mockResolvedValue(createdUserPayload);
      jwtSignMock.mockReturnValue('signed-token');

      const result = await service.register({
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        password: 'password123',
      });

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
      expect(jwtSignMock).toHaveBeenCalledWith(createdUserPayload);
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw if username already exists', async () => {
      const error = new Error('Username is occupied');
      userNameIsAvailableMock.mockRejectedValue(error);

      await expect(
        service.register({
          firstName: 'Alice',
          userName: 'alice',
          email: 'alice@mail.com',
          password: 'password123',
        }),
      ).rejects.toThrow(error);

      expect(userNameIsAvailableMock).toHaveBeenCalledWith('alice');
      expect(emailIsAvailableMock).not.toHaveBeenCalled();
      expect(createUserMock).not.toHaveBeenCalled();
      expect(genSaltMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(jwtSignMock).not.toHaveBeenCalled();
    });

    it('should throw if email already exists', async () => {
      const error = new Error('Email is occupied');
      emailIsAvailableMock.mockRejectedValue(error);

      await expect(
        service.register({
          firstName: 'Alice',
          userName: 'alice',
          email: 'alice@mail.com',
          password: 'password123',
        }),
      ).rejects.toThrow(error);

      expect(userNameIsAvailableMock).toHaveBeenCalledWith('alice');
      expect(emailIsAvailableMock).toHaveBeenCalledWith('alice@mail.com');
      expect(createUserMock).not.toHaveBeenCalled();
      expect(genSaltMock).not.toHaveBeenCalled();
      expect(hashMock).not.toHaveBeenCalled();
      expect(jwtSignMock).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return null if email does not exist', async () => {
      findByEmailMock.mockResolvedValue(null);

      const result = await service.validateUser({
        email: 'alice@mail.com',
        password: 'password123',
      });

      expect(findByEmailMock).toHaveBeenCalledWith('alice@mail.com');
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: 7,
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword: 'stored-hash',
        hashedSalt: 'stored-salt',
      };

      findByEmailMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(false as never);

      const result = await service.validateUser({
        email: 'alice@mail.com',
        password: 'wrong-password',
      });

      expect(compareMock).toHaveBeenCalledWith('wrong-password', 'stored-hash');
      expect(result).toBeNull();
    });

    it('should return user if credentials are valid', async () => {
      const user = {
        id: 7,
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword: 'stored-hash',
        hashedSalt: 'stored-salt',
      };

      findByEmailMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true as never);

      const result = await service.validateUser({
        email: 'alice@mail.com',
        password: 'password123',
      });

      expect(compareMock).toHaveBeenCalledWith('password123', 'stored-hash');
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should return access token for valid user', () => {
      const user: User = {
        id: 7,
        firstName: 'Alice',
        userName: 'alice',
        email: 'alice@mail.com',
        hashedPassword: 'stored-hash',
        hashedSalt: 'stored-salt',
      };

      jwtSignMock.mockReturnValue('signed-token');

      const result = service.login(user);

      expect(jwtSignMock).toHaveBeenCalledWith({
        email: 'alice@mail.com',
        sub: 7,
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
