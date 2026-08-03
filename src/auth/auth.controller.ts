import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LocalGuard } from './guards/local.guards';
import type { requestWithUser } from './auth.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  login(@Req() req: requestWithUser) {
    const user = req.user;

    return this.authService.login(user);
  }

  @Post('register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }
}
