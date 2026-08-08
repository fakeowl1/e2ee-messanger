import { WsException } from '@nestjs/websockets';
import { ChatGateway } from './chat.gateway';
import { SessionService } from './session.service';
import { UserService } from 'src/user/user.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let sessionCreateMock: jest.Mock;
  let findByEmailMock: jest.Mock;
  let emitMock: jest.Mock;

  beforeEach(() => {
    sessionCreateMock = jest.fn();
    findByEmailMock = jest.fn();
    emitMock = jest.fn();

    gateway = new ChatGateway(
      {
        create: sessionCreateMock,
      } as unknown as SessionService,
      {
        findByEmail: findByEmailMock,
      } as unknown as UserService,
    );

    gateway.server = {
      emit: emitMock,
    } as never;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit a room message on connection', () => {
    gateway.handleConnection({ id: 'socket-1' } as never);

    expect(emitMock).toHaveBeenCalledWith('room', 'socket-1 joined!');
  });

  it('should emit a room message on disconnect', () => {
    gateway.handleDisconnect({ id: 'socket-1' } as never);

    expect(emitMock).toHaveBeenCalledWith('room', 'socket-1 left!');
  });

  it('should create a session for the authenticated user', async () => {
    const client = {
      data: {
        user: { email: 'alice@mail.com' },
      },
    } as never;
    const session = { id: 10 };
    const newSession = { publicKey: 'public-key' };
    const user = { id: 7, email: 'alice@mail.com' };

    findByEmailMock.mockResolvedValue(user);
    sessionCreateMock.mockResolvedValue(session);

    await expect(gateway.getUserPublicKey(client, newSession)).resolves.toBe(
      session,
    );

    expect(findByEmailMock).toHaveBeenCalledWith('alice@mail.com');
    expect(sessionCreateMock).toHaveBeenCalledWith(7, newSession);
  });

  it('should throw if the user no longer exists', async () => {
    const client = {
      data: {
        user: { email: 'alice@mail.com' },
      },
    } as never;

    findByEmailMock.mockResolvedValue(null);

    await expect(
      gateway.getUserPublicKey(client, { publicKey: 'public-key' }),
    ).rejects.toBeInstanceOf(WsException);

    expect(findByEmailMock).toHaveBeenCalledWith('alice@mail.com');
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });
});
