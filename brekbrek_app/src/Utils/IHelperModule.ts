export interface IHelperModule {
  getDeviceId: () => string;
  getServiceStatus: () => Promise<string>;
  startService: (channelName: string, channelId: string) => Promise<void>;
  stopService: () => Promise<void>;
  startRecord: () => Promise<void>;
  registerPlayerListener: () => Promise<void>;
  stopRecord: () => Promise<void>;
  startPlay: () => Promise<void>;
  stopPlay: () => Promise<void>;
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
