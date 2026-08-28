import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let sessionServiceMock: {
    findById: jest.Mock;
    findActiveByUserKeyId: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    sessionServiceMock = {
      findById: jest.fn(),
      findActiveByUserKeyId: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: sessionServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
