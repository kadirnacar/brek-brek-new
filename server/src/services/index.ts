import { DataService } from './DataService';

export { BaseActions } from './BaseService';
export { DataService } from './DataService';
export { logger, LoggerService } from './LoggerService';
export { SocketService } from './SocketService';
export { default as InviteService } from './InviteService';

export const Services = {
  Data: new DataService()
};
