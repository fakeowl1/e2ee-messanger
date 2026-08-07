import { Injectable } from '@nestjs/common';
import { CreateNewSessionDto } from './dto/session.dto';
import { SessionRepository } from './session.repository';
import type { NewSession } from './session.repository';
import { UserKeyService } from './user-key.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRep: SessionRepository,
    private readonly userKeyService: UserKeyService,
  ) {}

  async create(userId: number, newSessionDto: CreateNewSessionDto) {
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 1);

    const sessionKey = await this.userKeyService.createUserPublicKey(
      userId,
      newSessionDto,
    );

    const sessionData: NewSession = {
      userKeyId: sessionKey.id,
      expireDate: expireDate,
    };

    const session = await this.sessionRep.create(sessionData);

    return session;
  }
}
