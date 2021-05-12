import { LangDbManager } from "../repository";

export class LangService {
  public getList(): any[] {
    return LangDbManager.all();
  }

  public getItem(id: string): any {
    return LangDbManager.get(id);
  }

  public save(model: any): void {
    LangDbManager.save(model);
  }

  public delete(id: string): void {
    LangDbManager.delete(id);
  }
}
