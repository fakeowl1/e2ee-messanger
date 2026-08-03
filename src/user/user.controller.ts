import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guards';
import type { requestWithUser } from 'src/auth/auth.type';
import { UserDetailsDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async currentUser(@Req() req: requestWithUser): Promise<UserDetailsDto> {
    const reqUser = req.user;

    const user = await this.userService.findByEmail(reqUser.email);

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    return new UserDetailsDto(user);
  }
}
