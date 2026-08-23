import { IsNotEmpty } from 'class-validator';

export class CreateNewSessionDto {
  @IsNotEmpty()
  publicKey: string;
}
