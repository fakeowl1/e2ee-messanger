import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/message.dto';
import { JwtService } from '@nestjs/jwt';

type MockSocket = Partial<Socket> & {
  data: {
    user: {
      sub: number;
    };
  };
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let messageServiceMock: { create: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    messageServiceMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: MessageService,
          useValue: messageServiceMock,
        },
        JwtService,
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('newMessage', () => {
    it('should create and return a new message for authorized socket', async () => {
      const mockClient: MockSocket = {
        data: {
          user: {
            sub: 42,
          },
        },
      };

      const dto: CreateMessageDto = {
        sessionID: 1,
        chatId: 10,
        receiverUserID: 7,
        encryptedMessageText: 'Encrypted payload string',
        timestamp: new Date(),
      };

      const mockCreatedMessage = {
        id: 101,
        senderId: 42,
        receiverId: 7,
        encryptedMessage: 'Encrypted payload string',
        timestamp: new Date(),
      };

      messageServiceMock.create.mockResolvedValue(mockCreatedMessage);

      const result = await gateway.newMessage(mockClient as Socket, dto);

      expect(messageServiceMock.create).toHaveBeenCalledWith(42, dto);
      expect(result).toEqual(mockCreatedMessage);
    });
  });
});
