import { Injectable } from '@nestjs/common';
import {
  NewUserPublicKey,
  UserPublicKey,
  UserKeyRepository,
} from './user-key.repository';
import { CreateNewSessionDto } from './dto/session.dto';

@Injectable()
export class UserKeyService {
  constructor(private readonly userKeyRep: UserKeyRepository) {}

  async createUserPublicKey(
    userId: number,
    dto: CreateNewSessionDto,
  ): Promise<UserPublicKey> {
    const userKeyData: NewUserPublicKey = {
      userId: userId,
      publicKey: dto.publicKey,
    };

    const newUserKey: UserPublicKey = await this.userKeyRep.create(userKeyData);

    return newUserKey;
  }
}
