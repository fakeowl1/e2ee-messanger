import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, ConfigModule.forRoot({ load: [jwtConfig] })],
      providers: [AuthService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
