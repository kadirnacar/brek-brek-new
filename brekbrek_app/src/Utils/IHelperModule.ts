export interface IHelperModule {
  getDeviceId: () => string;
  getServiceStatus: () => string;
  startService: (channelName: string, channelId: string) => Promise<void>;
  stopService: () => Promise<void>;
}
