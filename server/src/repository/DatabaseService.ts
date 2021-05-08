import Utils from './utils';
import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as path from 'path';

const serializer = {
  serialize: (array) => {
    return JSON.stringify(array, (key, value) => {
      if (value !== null && value !== '' && value !== undefined) return value;
    });
  },
  deserialize: (string) => JSON.parse(string),
};

export default class DatabaseService {
  constructor(entityName: string, parentEntityName?: string[], multi: boolean = true, defaultSchema: any = {}) {
    this.entityName = entityName;
    this.parentEntityName = parentEntityName;
    this.multi = multi;
    this.defaultSchema = defaultSchema;
    if (!this.parentEntityName) {
      this.init();
    }
  }

  private multi: boolean = true;
  private defaultSchema: any = {};
  private entityName: string;
  private parentEntityName: string[];
  private dbAdapter: any = {};
  private db: any = {};

  private init() {
    const filePath = path.resolve('dist', 'data', this.entityName);
    if (!Utils.checkFileExists(filePath)) Utils.mkDirByPathSync(filePath);
    this.dbAdapter = new FileSync(path.resolve(filePath, 'index.json'), serializer);
    this.db = lowdb(this.dbAdapter);
    if (!this.db.has(this.entityName).value()) {
      var defaultSchema = {};
      defaultSchema[this.entityName] = this.multi ? [] : this.defaultSchema;
      this.db.defaults(defaultSchema).write();
    }
  }

  public getDb(parentId?: string): any {
    if (this.parentEntityName == null || this.parentEntityName.length == 0) {
      return this.db.get(this.entityName);
    } else if (parentId) {
      if (!this.db[parentId]) {
        const filePath = path.resolve('dist', 'data', this.parentEntityName.join('\\'), parentId, this.entityName);
        if (!Utils.checkFileExists(filePath)) Utils.mkDirByPathSync(filePath);
        // this.dbAdapter[parentId] = new FileAsync(path.resolve(filePath, "index.json"), serializer);
        this.dbAdapter[parentId] = new FileSync(path.resolve(filePath, 'index.json'), serializer);

        this.db[parentId] = lowdb(this.dbAdapter[parentId]);
        if (!this.db[parentId].has(this.entityName).value()) {
          var defaultSchema = {};
          defaultSchema[this.entityName] = this.multi ? [] : this.defaultSchema;
          this.db[parentId].defaults(defaultSchema).write();
        }
      }
      return this.db[parentId].get(this.entityName);
    }
  }
  public allT<T>(parentId?: string): T[] {
    const result = this.getDb(parentId).value();
    return result as T[];
  }

  public all(parentId?: string): any[] {
    const result = this.getDb(parentId).value();
    return result;
  }

  public get(id: string, parentId?: string): Promise<any> {
    const db = this.getDb(parentId);
    const data = this.multi ? db.find({ id: id }).value() : db.value();
    return data;
  }

  public save(model, parentId?: string): void {
    var db = this.getDb(parentId);
    var data = this.multi ? db.find({ id: model.id }).value() : db.value();
    if (data) {
      this.multi ? db.find({ id: model.id }).assign(model).write() : db.assign(model).write();
    } else {
      this.multi ? db.push(model).write() : db.assign(model).write();
    }
  }

  public delete(id: string, parentId?: string): void {
    const item = this.get(id, parentId);
    if (item) {
      const db = this.getDb(parentId);

      this.multi ? db.remove({ id: id }).write() : db.assign({}).write();

      if (!this.parentEntityName || this.parentEntityName.length > 0) {
        try {
          const filePath = path.resolve('dist', 'data', this.parentEntityName.join('\\'), parentId, this.entityName);
          Utils.deleteFolderRecursive(filePath);
        } catch {}
      }
    }
  }
}
