import { RtcConnection } from './RtcConnection';
import { uuidv4 } from './Tools';

class JavaJsModule {
  constructor() {}

  private static instance: JavaJsModule;
  private rtcConnection: RtcConnection;

  public static getInstance(): JavaJsModule {
    if (!JavaJsModule.instance) {
      JavaJsModule.instance = new JavaJsModule();
    }

    return JavaJsModule.instance;
  }

  async callScript(message: any) {
    if (message.type == 'service') {
      if (message.status) {
        await this.startRtcConnection();
      } else {
        this.stopRtcConnection();
      }
    }
  }

  private async startRtcConnection() {
    if (!this.rtcConnection) {
      this.rtcConnection = new RtcConnection(
        `ws://192.168.0.12:3005?clientId=${uuidv4()}&type=player`
      );
    }
    this.rtcConnection.connectServer();
    this.rtcConnection.onMessage = (msg) => {
      console.log('rtc connection', msg);
      if (msg.type == 'clients') {
        const streamer = msg.data.find((x: any) => x.type == 'streamer');
        console.log(streamer);
        if (streamer) {
          this.rtcConnection.connectToPeer(streamer.clientId);
        }
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
