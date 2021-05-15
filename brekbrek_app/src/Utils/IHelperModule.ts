export interface IHelperModule {
  getDeviceId: () => string;
  getServiceStatus: () => string;
  testNetwork: () => Promise<void>;
  startRecorder: () => Promise<void>;
  stopRecorder: () => Promise<void>;
  startService: (channelName: string) => Promise<void>;
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
