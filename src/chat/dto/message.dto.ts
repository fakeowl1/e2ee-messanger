import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  sessionID: number;

  @IsNotEmpty()
  receiverUserID: number;

  @IsNotEmpty()
  encryptedMessageText: string;

  @IsNotEmpty()
  timestamp: Date;
}
