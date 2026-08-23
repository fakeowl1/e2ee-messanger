import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService, NewUser } from 'src/user/user.service';

import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register({
    firstName,
    userName,
    email,
    password,
  }: RegisterUserDto): Promise<{ access_token: string }> {
    await this.userService.userNameIsAvailable(userName);
    await this.userService.emailIsAvailable(email);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: NewUser = {
      firstName,
      userName,
      email,
      hashedPassword,
      hashedSalt: salt,
    };

    const payload = await this.userService.create(newUser);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser({ email, password }: UserLoginDto) {
    const user = await this.userService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) return null;

    return user;
  }

  login(user: { email: string; id: number }): { access_token: string } {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
