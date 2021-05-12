import { BaseActions } from './BaseService';

interface ServicesMetadata {
  [key: string]: BaseActions<any>;
}

export class DataService {
  constructor() {}

  services: ServicesMetadata = {};

  getService(entity: string) {
    if (!this.services[entity]) {
      this.services[entity] = new BaseActions(entity);
    }
    return this.services[entity];
  }

  public getList(entity: string, findOptions?: any): Realm.Results<any> {
    return this.getService(entity).getList();
  }

  public getById(entity: string, id: number): any {
    return this.getService(entity).getById(id);
  }

  public async update(entity: string, id: number, model: Partial<any>): Promise<any> {
    return await this.getService(entity).update(id, model);
  }

  public async save(entity: string, model: Partial<any>): Promise<any> {
    return await this.getService(entity).create(model);
  }
  
  public async delete(entity: string, id: number): Promise<void> {
    return await this.getService(entity).delete(id);
  }
}
