import { ObjectId } from 'bson';
import { Channels } from '../Models';
import { RealmService } from '../realm/RealmService';
import { uuidv4 } from '../Utils/Tools';

class ChannelService {
  constructor() {
    this.channelRepo = new RealmService<Channels>('Channels');
  }

  private channelRepo: RealmService<Channels>;

  private static instance: ChannelService;

  public static getInstance(): ChannelService {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }

    return ChannelService.instance;
  }

  public get(id: string | ObjectId) {
    return this.channelRepo.getById(new ObjectId(id));
  }

  public getChannels() {
    return this.channelRepo.getAll();
  }

  public getUser(id: string) {
    return this.channelRepo.getById(new ObjectId(id));
  }

  public async save(data: Partial<Channels>) {
    return await this.channelRepo.save({
      id: new ObjectId(),
      Contacts: [],
      Name: '',
      refId: uuidv4(),
      ...data,
    });
  }

  public async update(data: Partial<Channels>) {
    return await this.channelRepo.update(data.id, data);
  }

  public async delete(id: string | ObjectId) {
    const data = this.channelRepo.getById(new ObjectId(id));
    if (data) {
      await this.channelRepo.delete(data);
    }
  }
}
export default ChannelService.getInstance();
