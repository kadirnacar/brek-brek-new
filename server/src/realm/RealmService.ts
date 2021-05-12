import { Models } from '@models';
import Realm from 'realm';
import 'reflect-metadata';

export class RealmService<T> {
  constructor(entityName: string) {
    this.modelType = entityName;
    if (!RealmService.realm) {
      try {
        RealmService.realm = new Realm({
          path: 'data/database.realm',
          schemaVersion: 1,
          schema: Object.keys(Models).map((x) => {
            return Reflect.get(Models[x], 'schema');
          }),
        });
      } catch (ex) {}
    }
  }

  private static realm: Realm;
  private modelType;
  getById(id: any) {
    if (RealmService.realm) {
      const item: T = RealmService.realm.objectForPrimaryKey<T>(this.modelType, id);
      return item;
    } else {
      return null;
    }
  }

  getAll(): Realm.Results<T> {
    if (RealmService.realm) {
      const list = RealmService.realm.objects<T>(this.modelType);
      return list;
    } else {
      return null;
    }
  }
  update(model: T, updates: Partial<T>): Promise<T> {
    return new Promise((resolve) => {
      RealmService.realm.write(() => {
        Object.getOwnPropertyNames(updates).forEach((x) => {
          model[x] = updates[x];
        });
        resolve(model);
      });
    });
  }

  save(model: T): Promise<T & Realm.Object> {
    return new Promise((resolve) => {
      RealmService.realm.write(() => {
        const d = RealmService.realm.create<T>(this.modelType, model);
        resolve(d);
      });
    });
  }
  delete(model: T | Realm.Results<T> | T[]) {
    RealmService.realm.write(() => {
      RealmService.realm.delete(model);
    });
  }
}
