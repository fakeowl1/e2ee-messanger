import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { NewUser } from 'src/user/user.repository';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async register(
    firstName: string,
    userName: string,
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
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

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, username: user.userName };

    const jwtOptions = this.configService.get<JwtSignOptions>('jwt');

    return {
      access_token: this.jwtService.sign(payload, jwtOptions),
    };
  }
}
