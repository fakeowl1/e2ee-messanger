import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { RequestWithJwtUser } from 'src/auth/auth.type';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guards';
import { CreateNewSessionDto } from './dtos/session.dto';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionServ: SessionService) {}

  @Post('newSession')
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Req() reqWithJwtUser: RequestWithJwtUser,
    @Body() newSessionDto: CreateNewSessionDto,
  ) {
    const user = reqWithJwtUser.user;

    const session = await this.sessionServ.create(user.sub, newSessionDto);
    return session;
  }
}
