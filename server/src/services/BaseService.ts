import { Repository } from '@repository';

export class BaseActions<T> {
  constructor(entityName: string) {
    this.repo = new Repository(entityName);
  }

  repo: Repository<T>;

  public getList(): Realm.Results<T> {
    return this.repo.all();
  }

  public getById(id: any): T {
    return this.repo.get(id);
  }

  public async update(id: any, model: Partial<T>): Promise<T> {
    return await this.repo.update(id, model);
  }

  public async create(model: T): Promise<T> {
    return await this.repo.create(model);
  }

  public async delete(id: any) {
    this.repo.delete(id);
  }
}
