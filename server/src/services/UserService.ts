import { User } from '@models';
import * as bcrypt from 'bcryptjs';
import { BaseActions } from './BaseService';

export class UserService extends BaseActions<User> {
  constructor() {
    super('User');
  }
  
  public getUser(email: string): User {
    return this.getList().find((x) => x.Email == email);
  }

  public checkIfUnencryptedPasswordIsValid(crytpedPassword: string, unencryptedPassword: string) {
    var result = bcrypt.compareSync(unencryptedPassword, crytpedPassword);
    return result;
  }
}
