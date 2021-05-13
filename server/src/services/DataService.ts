import { Models } from '@models';
import { BaseActions } from './BaseService';

interface ServicesMetadata {
  [key: string]: BaseActions<any>;
}

export class DataService {
  constructor() {}

  services: ServicesMetadata = {};

  getService(entity: keyof typeof Models) {
    if (!this.services[entity]) {
      this.services[entity] = new BaseActions(entity);
    }
    return this.services[entity];
  }

  public getList(entity: keyof typeof Models, findOptions?: any): Realm.Results<any> {
    return this.getService(entity).getList();
  }

  public getById(entity: keyof typeof Models, id: number): any {
    return this.getService(entity).getById(id);
  }

  public async update(entity: keyof typeof Models, id: number, model: Partial<any>): Promise<any> {
    return await this.getService(entity).update(id, model);
  }

  public async save(entity: keyof typeof Models, model: Partial<any>): Promise<any> {
    return await this.getService(entity).create(model);
  }

  public async delete(entity: keyof typeof Models, id: number): Promise<void> {
    return await this.getService(entity).delete(id);
  }
}
