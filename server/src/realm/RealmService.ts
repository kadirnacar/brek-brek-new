import { Shader } from '../models/Shader';
import Realm from 'realm';
import 'reflect-metadata';

export class RealmService<T> {
  constructor(arg: { new (): T }) {
    this.modelType = Reflect.get(arg, 'schema')?.name;
    if (!RealmService.realm) {
      try {
        RealmService.realm = new Realm({
          path: 'data/database.realm',
          schemaVersion: 1,
          schema: [Shader].map((x) => {
            return Reflect.get(x, 'schema');
          }),
        });
      } catch (ex) {}
    }
  }

  private static realm: Realm;
  private modelType;
  getById(id: any) {
    if (RealmService.realm) {
      const list: T = RealmService.realm.objectForPrimaryKey<T>(this.modelType, id);
      return list;
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
  update(model: T, updates: T) {
    RealmService.realm.write(() => {
      Object.getOwnPropertyNames(updates).forEach((x) => {
        model[x] = updates[x];
      });
    });
  }

  save(model: T) {
    RealmService.realm.write(() => {
      const d = RealmService.realm.create<T>(this.modelType, model);
    });
  }
  delete(model: T | Realm.Results<T> | T[]) {
    RealmService.realm.write(() => {
      RealmService.realm.delete(model);
    });
  }
}
