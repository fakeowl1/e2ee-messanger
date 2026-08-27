import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async allUsers(): Promise<string> {
    const users = await this.userService.findAll();

    return JSON.stringify(users);
  }
}
