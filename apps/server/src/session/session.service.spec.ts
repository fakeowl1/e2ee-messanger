import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service';
import { DRIZZLE } from 'src/database/database.constants';
import * as schema from 'src/database/schema';

type MockDb = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
};

describe('SessionService', () => {
  let service: SessionService;
  let dbMock: MockDb;

  beforeEach(async () => {
    jest.clearAllMocks();

    dbMock = {
      select: jest.fn(),
      from: jest.fn(),
      where: jest.fn(),
      limit: jest.fn(),
      insert: jest.fn(),
      values: jest.fn(),
      returning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: DRIZZLE,
          useValue: dbMock,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a session when found', async () => {
      const mockSession = {
        id: 1,
        ownerUserId: 2,
        userKeyId: 3,
        status: 'active',
        expireDate: new Date(),
      };

      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([mockSession]);

      const result = await service.findById(1);

      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.from).toHaveBeenCalledWith(schema.sessions);
      expect(dbMock.where).toHaveBeenCalled();
      expect(dbMock.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSession);
    });

    it('should return null when session is not found', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([]);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findActiveByUserKeyId', () => {
    it('should return an active session for valid userKeyId', async () => {
      const mockSession = {
        id: 1,
        ownerUserId: 2,
        userKeyId: 3,
        status: 'active',
        expireDate: new Date(Date.now() + 1000000),
      };

      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([mockSession]);

      const result = await service.findActiveByUserKeyId(3);

      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.from).toHaveBeenCalledWith(schema.sessions);
      expect(dbMock.where).toHaveBeenCalled();
      expect(dbMock.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSession);
    });

    it('should return null if no active session exists', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([]);

      const result = await service.findActiveByUserKeyId(3);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const userId = 2;
    const dto = { publicKey: 'sample-public-key' };

    it('should throw BadRequestException if user does not exist', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([]);

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.from).toHaveBeenCalledWith(schema.users);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it('should insert key and session successfully when user exists', async () => {
      const mockCreatedKey = { id: 10, userId, publicKey: dto.publicKey };
      const mockCreatedSession = {
        id: 100,
        ownerUserId: userId,
        userKeyId: 10,
        status: 'active',
        expireDate: expect.any(Date) as unknown,
      };

      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValue([{ exists: 1 }]);

      dbMock.insert.mockReturnValue(dbMock);
      dbMock.values.mockReturnValue(dbMock);
      dbMock.returning
        .mockResolvedValueOnce([mockCreatedKey])
        .mockResolvedValueOnce([mockCreatedSession]);

      const result = await service.create(userId, dto);

      expect(dbMock.from).toHaveBeenCalledWith(schema.users);

      expect(dbMock.insert).toHaveBeenCalledWith(schema.userPublicKeys);
      expect(dbMock.values).toHaveBeenCalledWith({
        userId: userId,
        publicKey: dto.publicKey,
      });

      expect(dbMock.insert).toHaveBeenCalledWith(schema.sessions);
      expect(dbMock.values).toHaveBeenCalledWith({
        userKeyId: mockCreatedKey.id,
        ownerUserId: userId,
        expireDate: expect.any(Date) as unknown,
      });

      expect(result).toEqual(mockCreatedSession);
    });
  });
});
