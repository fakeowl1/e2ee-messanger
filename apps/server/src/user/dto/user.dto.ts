import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  userName: string;

  @Expose()
  firstName: string;

  @Exclude()
  hashedPassword: string;

  @Exclude()
  hashedSalt: string;
}
