import { NavigationContainerRef } from '@react-navigation/core';
import { NativeModules } from 'react-native';
import { RtcConnection } from '../Connection/RtcConnection';
import { Users } from '../Models';
import { UserService } from '../Services';
import { config } from './config';
import { IHelperModule } from './IHelperModule';
import { decode, encode } from 'base64-arraybuffer';

const HelperModule: IHelperModule = NativeModules.HelperModule;
const WebRTCModule = NativeModules.WebRTCModule;

class JavaJsModule {
  constructor() {
    this.user = UserService.getSystemUser();
  }

  private static instance: JavaJsModule;
  public rtcConnection?: RtcConnection;
  private navigation: NavigationContainerRef;
  private user?: Users;

  public setNavigation(nav: NavigationContainerRef) {
    this.navigation = nav;
  }

  public static getInstance(): JavaJsModule {
    if (!JavaJsModule.instance) {
      JavaJsModule.instance = new JavaJsModule();
    }

    return JavaJsModule.instance;
  }

  public async startPlay() {
    await HelperModule.startPlay();
  }

  public async stopPlay() {
    await HelperModule.stopPlay();
  }

  public async startRecord() {
    this.rtcConnection?.sendMessageToAllPeers({ type: 'speak', status: true });
    await HelperModule.startRecord();
  }

  public async stopRecord() {
    this.rtcConnection?.sendMessageToAllPeers({ type: 'speak', status: false });
    await HelperModule.stopRecord();
  }

  async callScript(message: any) {
    if (!this.user) {
      this.user = UserService.getSystemUser();
    }
    if (message.type == 'service') {
      if (message.status) {
        await this.startRtcConnection(message.channelId);
      } else {
        this.stopRtcConnection();
      }
    }
  }

  public checkUser(peerId: string) {
    this.rtcConnection?.sendMessageToPeer(peerId, {
      type: 'check-user',
      userId: this.user?.id,
      date: this.user?.LastUpdate,
    });
  }

  private async startRtcConnection(channelId: string) {
    this.stopRtcConnection();
    this.rtcConnection = new RtcConnection(`${config.socketUrl}/${channelId}`);

    this.rtcConnection.onPeerConnectionCompleted = async (peerId) => {
      await HelperModule.registerPlayerListener();
      this.checkUser(peerId);
    };

    this.rtcConnection.connectServer();

    this.rtcConnection.onPeerMessage = async (peerId, msg) => {
      if (msg.data && msg.data.type) {
        const { userId, date, name, image } = msg.data;
        switch (msg.data.type) {
          case 'speak':
            if (msg.data.status) {
              await HelperModule.startPlay();
            } else {
              await HelperModule.stopPlay();
            }
            break;
          case 'check-user':
            if (userId) {
              const contact = UserService.getContactById(userId);
              if (contact?.LastUpdate != new Date(date)) {
                this.rtcConnection?.sendMessageToPeer(peerId, {
                  type: 'get-update',
                });
              }
            }
            break;
          case 'get-update':
            this.rtcConnection?.sendMessageToPeer(peerId, {
              type: 'set-update',
              userId: this.user?.id,
              name: this.user?.Name,
              date: this.user?.LastUpdate,
              image: this.user?.Image ? encode(this.user?.Image) : null,
            });
            break;
          case 'set-update':
            console.log(userId);
            if (userId) {
              const contact = UserService.getContactById(userId);
              if (contact) {
                await UserService.update({
                  id: contact.id,
                  Image: image ? decode(image) : undefined,
                  LastUpdate: new Date(date),
                  Name: name,
                });
                this.navigation.setParams({ time: new Date().toTimeString() });
              }
            }
            break;
          default:
            console.log('onPeerMessage else', msg);
            break;
        }
      }
    };

    this.rtcConnection.onMessage = async (msg) => {
      if (msg.type && (msg.type == 'connection' || 'peers')) {
        try {
          this.navigation.setParams({ contactId: msg.contactId, status: msg.status });
        } catch {}
      } else {
        console.log('type null', msg);
      }
    };
  }

  private stopRtcConnection() {
    if (this.rtcConnection) {
      this.rtcConnection.disconnectServer();
    }
    this.rtcConnection = undefined;
  }
}
export default JavaJsModule.getInstance();
