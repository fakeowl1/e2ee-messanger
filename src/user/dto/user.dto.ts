export class UserDetailsDto {
  id: number;
  email: string;
  userName: string;
  firstName: string;

  constructor(user: {
    id: number;
    email: string;
    userName: string;
    firstName: string;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.userName = user.userName;
    this.firstName = user.firstName;
  }
}
