import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export type JwtPayload = {
  sub: number;
  email: string;
};

interface CustomSocketData {
  user?: JwtPayload;
  sub?: number;
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Unauthorized: Missing authentication token');
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      const socketData = client.data as CustomSocketData;
      socketData.user = payload;
      socketData.sub = payload.sub;
    } catch {
      throw new WsException('Unauthorized: Invalid or expired token');
    }

    return true;
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const token = auth?.token;

    if (typeof token !== 'string' || token.trim().length === 0) {
      return null;
    }

    return token;
  }
}
