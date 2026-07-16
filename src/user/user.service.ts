import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) { }
  async findAll() {
    return this.userRepository.findAll();
  }
}
