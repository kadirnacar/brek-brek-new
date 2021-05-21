import { Models } from '../models';
import Realm from 'realm';
import 'reflect-metadata';

export class RealmService<T> {
  constructor(entityName: keyof typeof Models) {
    this.modelType = entityName;
    if (!RealmService.realm) {
      try {
        RealmService.realm = new Realm({
          path: `data/database.realm`,
          schemaVersion: 3,
          schema: Object.keys(Models).map((x) => {
            const d = x as keyof typeof Models;
            return Reflect.get(Models[d], 'schema');
          }),
        });
      } catch (ex) {
        throw ex;
      }
    }
  }

  private static realm: Realm;
  private modelType;

  addListener(callback: Realm.CollectionChangeCallback<T>) {
    RealmService.realm.objects<T>(this.modelType).addListener(callback);
  }

  removeListener(callback: Realm.CollectionChangeCallback<T>) {
    RealmService.realm.objects<T>(this.modelType).removeListener(callback);
  }

  removeAllListener(name: string) {
    RealmService.realm.objects<T>(this.modelType).removeAllListeners();
  }

  getById(id: any): T | undefined {
    if (RealmService.realm) {
      const item: T = <T>RealmService.realm.objectForPrimaryKey<T>(this.modelType, id);
      return item;
    } else {
      return undefined;
    }
  }

  getAll(): Realm.Results<T> | undefined {
    if (RealmService.realm) {
      const list = RealmService.realm.objects<T>(this.modelType);
      return list;
    } else {
      return undefined;
    }
  }
  update(id: any, updates: Partial<T>): Promise<T> {
    return new Promise((resolve) => {
      const model: T | any = this.getById(id);
      RealmService.realm.write(() => {
        Object.getOwnPropertyNames(updates).forEach((x) => {
          const d = x as keyof T;
          if (d !== 'id') {
            model[x] = updates[d];
          }
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
  delete(model: T): Promise<void> {
    return new Promise((resolve) => {
      RealmService.realm.write(() => {
        RealmService.realm.delete(model);
        resolve(undefined);
      });
    });
  }
}
