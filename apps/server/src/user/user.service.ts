import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository, NewUser } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findAll() {
    return this.userRepository.findAll();
  }

  async findByUsername(userName: string) {
    return this.userRepository.findByUserName(userName);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async userNameIsAvailable(userName: string) {
    const isUserExists = await this.userRepository.findByUserName(userName);

    if (isUserExists) {
      throw new BadRequestException('Username is occupied');
    }
  }

  async emailIsAvailable(email: string) {
    const isUserExists = await this.userRepository.findByEmail(email);

    if (isUserExists) {
      throw new BadRequestException('Email is occupied');
    }
  }

  async create(data: NewUser) {
    return this.userRepository.create(data);
  }
}
