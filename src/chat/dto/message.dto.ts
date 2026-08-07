import { IsNotEmpty } from 'class-validator';

export class NewMessageDto {
  @IsNotEmpty()
  recieverUserID: number;

  @IsNotEmpty()
  encryptedMessageText: string;
}
