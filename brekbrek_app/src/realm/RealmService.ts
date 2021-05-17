import { Models } from '../Models';
import Realm from 'realm';
import 'reflect-metadata';
import * as RNFS from 'react-native-fs';
import { IHelperModule } from '../Utils/IHelperModule';
import { NativeModules } from 'react-native';
import { decode } from 'base64-arraybuffer';
const HelperModule: IHelperModule = NativeModules.HelperModule;

export class RealmService<T> {
  constructor(entityName: keyof typeof Models) {
    this.modelType = entityName;
    if (!RealmService.realm) {
      try {
        const deviceId = HelperModule.getDeviceId();
        const key = decode(deviceId);
        const keyArray = new Int8Array(key);
        const encryptionKey = new Int8Array(new ArrayBuffer(64));
        encryptionKey.set(keyArray);

        RealmService.realm = new Realm({
          path: `${RNFS.CachesDirectoryPath}/data.realm`,
          schemaVersion: 3,
          deleteRealmIfMigrationNeeded: __DEV__,
          encryptionKey: __DEV__ ? undefined : encryptionKey,
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
