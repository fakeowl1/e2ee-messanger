import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: UserLoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(
      registerUserDto.firstName,
      registerUserDto.userName,
      registerUserDto.email,
      registerUserDto.password,
    );
  }
}
