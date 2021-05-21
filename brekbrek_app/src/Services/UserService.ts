import { ObjectId } from 'bson';
import { Users } from '../Models';
import { RealmService } from '../realm/RealmService';

class UserService {
  constructor() {
    this.userRepo = new RealmService<Users>('Users');
  }

  private userRepo: RealmService<Users>;

  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  public getSystemUser() {
    return this.userRepo.getAll()?.find((x) => x.isSystem);
  }

  public getContacts() {
    return this.userRepo.getAll()?.filter((x) => !x.isSystem);
  }

  public getUser(id: string) {
    return this.userRepo.getById(new ObjectId(id));
  }

  public async save(data: Partial<Users>) {
    return await this.userRepo.save({ id: new ObjectId(), isSystem: false, ...data });
  }

  public async update(data: Partial<Users>) {
    return await this.userRepo.update(data.id, data);
  }

  public async delete(id: string | ObjectId) {
    const data = this.userRepo.getById(new ObjectId(id));
    if (data) {
      await this.userRepo.delete(data);
    }
  }
}
export default UserService.getInstance();
