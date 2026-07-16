import { Controller, Get } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async allUsers(): Promise<string> {
    const users = await this.usersService.findAll();

    return JSON.stringify(users);
  }
}
