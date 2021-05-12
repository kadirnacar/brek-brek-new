import LangDb from './LangDb';
import SettingsDb from './SettingsDb';
import { RealmService } from '../realm/RealmService';
import { uuidv4 } from '../../tools';

const LangDbManager = new LangDb();
const SettingsDbManager = new SettingsDb();

export { LangDbManager, SettingsDbManager };

export class Repository<T> {
  constructor(entityName: string) {
    this.realm = new RealmService(entityName);
  }

  realm: RealmService<T>;

  async create(item: T): Promise<T> {
    if (!item['id']) {
      item['id'] = uuidv4();
    }
    return await this.realm.save(item);
  }

  async update(id: any, item: Partial<T>): Promise<T> {
    return await this.realm.update(this.realm.getById(id), item);
  }

  delete(id: any) {
    this.realm.delete(this.realm.getById(id));
  }

  all(): Realm.Results<T> {
    return this.realm.getAll();
  }

  get(id: any): T {
    return this.realm.getById(id);
  }
}
