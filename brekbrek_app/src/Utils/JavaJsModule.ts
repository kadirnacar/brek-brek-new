import { NativeModules } from 'react-native';
import { RtcConnection } from './RtcConnection';
import { uuidv4 } from './Tools';
import { IHelperModule } from './IHelperModule';

const HelperModule: IHelperModule = NativeModules.HelperModule;

class JavaJsModule {
  constructor() {
    this.clientId = uuidv4();
  }

  private static instance: JavaJsModule;
  private rtcConnection: RtcConnection;
  private clientId: string;

  public static getInstance(): JavaJsModule {
    if (!JavaJsModule.instance) {
      JavaJsModule.instance = new JavaJsModule();
    }

    return JavaJsModule.instance;
  }

  async callScript(message: any) {
    if (message.type == 'service') {
      console.log(message);
      if (message.status) {
        await this.startRtcConnection();
      } else {
        this.stopRtcConnection();
      }
    } else if (message.type == 'rtc') {
      if (
        message.type &&
        message.data &&
        message.data.type &&
        (message.data.type.toLowerCase() === 'offer' ||
          message.data.type.toLowerCase() === 'answer' ||
          message.data.type.toLowerCase() === 'candidate')
      ) {
        this.rtcConnection.sendMessage(message.peerId, message.data);
      }
    }
  }

  private async startRtcConnection() {
    if (!this.rtcConnection) {
      this.rtcConnection = new RtcConnection(
        `wss://192.168.0.12:3001?clientId=${this.clientId}&type=player`
      );
    }
    this.rtcConnection.connectServer();
    this.rtcConnection.onMessage = async (msg) => {
      if (msg.type && msg.type == 'clients') {
        const streamer = msg.data.find((x: any) => x.clientId !== this.clientId);
        if (streamer) {
          await HelperModule.createPeer(streamer.clientId);
        }
      } else if (msg.type && msg.type.toLowerCase() === 'offer') {
        await HelperModule.createAnswer(msg.from, msg.type, msg.description);
      } else if (msg.type && msg.type.toLowerCase() === 'answer') {
        await HelperModule.setAnswer(msg.from, msg.type, msg.description);
      } else if (msg.type && msg.type.toLowerCase() === 'candidate') {
        await HelperModule.setCandidate(msg.from, msg.sdpMLineIndex, msg.sdpMid, msg.candidate);
      } else {
        console.log('type null', msg);
      }
    };
  }

  private stopRtcConnection() {
    if (this.rtcConnection) {
      this.rtcConnection.disconnectServer(null);
    }
  }
}
export default JavaJsModule.getInstance();
