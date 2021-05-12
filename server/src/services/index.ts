import { UserService } from "./UserService";
export { UserService } from "./UserService";

import { LangService } from "./LangService";
export { LangService } from "./LangService";

import { SettingsService } from "./SettingsService";
export { SettingsService } from "./SettingsService";

import { DataService } from "./DataService";

export { logger, LoggerService } from "./LoggerService";
export { SocketService } from "./SocketService";
export { BaseActions } from "./BaseService";
export { DataService } from "./DataService";
export { MailServiceClass } from "./MailService";

export const Services = {
  User: new UserService(),
  Data: new DataService(),
  Lang: new LangService(),
  Settings: new SettingsService(),
};
