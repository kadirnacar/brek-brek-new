import { Settings } from '@models';
import { SettingsDbManager } from '../repository';

export class SettingsService {
  public getSettings(): Settings[] {
    return SettingsDbManager.all();
  }

  public save(model: any): void {
    SettingsDbManager.save(model);
  }
}
