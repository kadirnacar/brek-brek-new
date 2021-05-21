import { ObjectId } from 'bson';
import { Invite } from '../Models';
import { RealmService } from '../realm/RealmService';

class InviteService {
  constructor() {
    this.inviteRepo = new RealmService<Invite>('Invite');
  }

  private inviteRepo: RealmService<Invite>;

  private static instance: InviteService;

  public static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService();
    }

    return InviteService.instance;
  }

  public get(id: string | ObjectId) {
    return this.inviteRepo.getById(new ObjectId(id));
  }

  public getInvites() {
    return this.inviteRepo.getAll();
  }

  public getUser(id: string) {
    return this.inviteRepo.getById(new ObjectId(id));
  }

  public async save(data: Partial<Invite>) {
    return await this.inviteRepo.save({
      id: new ObjectId(),
      createDate: new Date(),
      name: '',
      refId: '',
      userId: '',
      ...data,
    });
  }

  public async update(data: Partial<Invite>) {
    return await this.inviteRepo.update(data.id, data);
  }

  public async delete(id: string | ObjectId) {
    const data = this.inviteRepo.getById(new ObjectId(id));
    if (data) {
      await this.inviteRepo.delete(data);
    }
  }
}
export default InviteService.getInstance();
