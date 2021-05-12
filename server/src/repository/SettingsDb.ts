import { Settings } from "@models";
import BaseDb from "./BaseDb";

export default class SettingsDb extends BaseDb {
  constructor() {
    const settings: Settings = { CarouselImages: [], MailSettings: {} };
    super("Settings", null, false, settings);
  }
}
