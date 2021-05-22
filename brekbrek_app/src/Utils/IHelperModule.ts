export interface IHelperModule {
  getDeviceId: () => string;
  getServiceStatus: () => string;
  startService: (channelName: string, channelId: string) => Promise<void>;
  stopService: () => Promise<void>;
  createPeer: (peerId: string) => Promise<void>;
  createAnswer: (peerId: string, type: string, description: string) => Promise<void>;
  setAnswer: (peerId: string, type: string, description: string) => Promise<void>;
  setCandidate: (
    peerId: string,
    sdpMLineIndex: number,
    sdpMid: string,
    candidate: string
  ) => Promise<void>;
}
