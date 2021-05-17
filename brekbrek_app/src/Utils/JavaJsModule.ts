import { NativeModules } from 'react-native';
import { RtcConnection } from './RtcConnection';
import { uuidv4 } from './Tools';
import { IHelperModule } from './IHelperModule';
import { config } from './config';
import { RealmService } from '../realm/RealmService';
import { Channels, Users } from '../Models';
import { ObjectId } from 'bson';

const HelperModule: IHelperModule = NativeModules.HelperModule;
const channelRepo: RealmService<Channels> = new RealmService<Channels>('Channels');
const usersRepo: RealmService<Users> = new RealmService<Users>('Users');

class JavaJsModule {
  constructor() {
    this.user = usersRepo.getAll()?.find((x) => x.isSystem);
  }

  private static instance: JavaJsModule;
  public rtcConnection?: RtcConnection;
  private clientId: string;
  private user?: Users;

  public static getInstance(): JavaJsModule {
    if (!JavaJsModule.instance) {
      JavaJsModule.instance = new JavaJsModule();
    }

    return JavaJsModule.instance;
  }

  async callScript(message: any) {
    if (message.type == 'service') {
      if (message.status) {
        await this.startRtcConnection(message.channelId);
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
        if (this.rtcConnection) {
          this.rtcConnection.sendMessage(message.peerId, message.data);
        }
      }
    }
  }

  private async startRtcConnection(channelId: string) {
    if (!this.rtcConnection) {
      const channel = channelRepo.getById(new ObjectId(channelId));
      this.user = usersRepo.getAll()?.find((x) => x.isSystem);
      this.clientId = `${channelId}/${channel?.refId}/${this.user?.id.toHexString()}`;
      this.rtcConnection = new RtcConnection(`${config.socketUrl}/${this.clientId}`);
    }
    this.rtcConnection.connectServer(true);
    this.rtcConnection.onMessage = async (msg) => {
      if (msg.type && msg.type == 'clients') {
        const streamers = msg.data.filter((x: any) => x.clientId !== this.clientId);
        console.log(streamers);
        if (streamers && streamers.length > 0) {
          for (let index = 0; index < streamers.length; index++) {
            const streamer = streamers[index];
            await HelperModule.createPeer(streamer.clientId);
          }
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
      this.rtcConnection = undefined;
    }
  }
}
export default JavaJsModule.getInstance();
