import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { DRIZZLE } from 'src/database/database.constants';
import { CreateMessageDto } from './dtos/message.dto';

type MockDb = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
};

describe('MessageService', () => {
  let service: MessageService;
  let dbMock: MockDb;

  const mockCreateMessageDto: CreateMessageDto = {
    receiverUserID: 2,
    chatId: 100,
    encryptedMessageText: 'encrypted_payload_string',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  };

  const mockInsertedMessage = {
    id: 1,
    senderId: 1,
    receiverId: 2,
    chatId: 100,
    encryptedText: 'encrypted_payload_string',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
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
        MessageService,
        {
          provide: DRIZZLE,
          useValue: dbMock,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a message successfully when all validations pass', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit
        .mockResolvedValueOnce([{ exists: 1 }])
        .mockResolvedValueOnce([{ exists: 1 }])
        .mockResolvedValueOnce([{ exists: 1 }]);

      dbMock.insert.mockReturnValue(dbMock);
      dbMock.values.mockReturnValue(dbMock);
      dbMock.returning.mockResolvedValue([mockInsertedMessage]);

      const result = await service.create(1, mockCreateMessageDto);

      expect(result).toEqual(mockInsertedMessage);
      expect(dbMock.select).toHaveBeenCalledTimes(3);
      expect(dbMock.insert).toHaveBeenCalledTimes(1);
      expect(dbMock.values).toHaveBeenCalledWith({
        senderId: 1,
        receiverId: mockCreateMessageDto.receiverUserID,
        chatId: mockCreateMessageDto.chatId,
        encryptedText: mockCreateMessageDto.encryptedMessageText,
        timestamp: mockCreateMessageDto.timestamp,
      });
    });

    it('should throw BadRequestException if receiver ID is invalid or does not exist', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit.mockResolvedValueOnce([]);

      await expect(service.create(1, mockCreateMessageDto)).rejects.toThrow(
        new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid receiverId field',
          field: 'receiverId',
        }),
      );

      expect(dbMock.select).toHaveBeenCalledTimes(1);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if sender ID is invalid or does not exist', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit
        .mockResolvedValueOnce([{ exists: 1 }]) // receiver exists
        .mockResolvedValueOnce([]); // sender not found

      await expect(service.create(1, mockCreateMessageDto)).rejects.toThrow(
        new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid senderUserId field',
          field: 'senderUserId',
        }),
      );

      expect(dbMock.select).toHaveBeenCalledTimes(2);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if chat ID is invalid or does not exist', async () => {
      dbMock.select.mockReturnValue(dbMock);
      dbMock.from.mockReturnValue(dbMock);
      dbMock.where.mockReturnValue(dbMock);
      dbMock.limit
        .mockResolvedValueOnce([{ exists: 1 }]) // receiver exists
        .mockResolvedValueOnce([{ exists: 1 }]) // sender exists
        .mockResolvedValueOnce([]); // chat not found

      await expect(service.create(1, mockCreateMessageDto)).rejects.toThrow(
        new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid chatid field',
          field: 'chatId',
        }),
      );

      expect(dbMock.select).toHaveBeenCalledTimes(3);
      expect(dbMock.insert).not.toHaveBeenCalled();
    });
  });
});
