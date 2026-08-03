import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { NewUser, User } from 'src/user/user.repository';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserLoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

    const jwtOptions = this.configService.get<JwtSignOptions>('jwt');

    return {
      access_token: this.jwtService.sign(payload, jwtOptions),
    };
  }

  async validateUser({ email, password }: UserLoginDto) {
    const user = await this.userService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) return null;

    return user;
  }

  login(user: { email: string; id: string }): { access_token: string } {
    const payload = { email: user.email, sub: user.id };

    const jwtOptions = this.configService.get<JwtSignOptions>('jwt');

    return {
      access_token: this.jwtService.sign(payload, jwtOptions),
    };
  }
}
