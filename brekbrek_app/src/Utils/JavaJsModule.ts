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

export enum PeerMessageType {
  Ping,
  Pong,
  Speak,
  UpdateContact,
}
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
    this.rtcConnection?.sendMessageToAllPeers({ type: PeerMessageType.Speak, status: true });
    await HelperModule.startRecord();
  }

  public async stopRecord() {
    this.rtcConnection?.sendMessageToAllPeers({ type: PeerMessageType.Speak, status: false });
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
    const contact = UserService.getContactByRefId(peerId);
    this.rtcConnection?.sendMessageToPeer(peerId, {
      type: PeerMessageType.Ping,
      userId: this.user?.id,
      mydate: this.user?.LastUpdate,
      udate: contact?.LastUpdate,
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
        const { userId, mydate, udate, getInfo, userName, userImage, userDate } = msg.data;
        switch (msg.data.type) {
          case PeerMessageType.Speak:
            if (msg.data.status) {
              await HelperModule.startPlay();
            } else {
              await HelperModule.stopPlay();
            }
            break;
          case PeerMessageType.Pong:
            this.rtcConnection?.closeSocket();
            this.navigation.setParams({ contactId: peerId, status: 'online' });
            if (userId) {
              const contact = UserService.getContactById(userId);
              if (contact) {
                try {
                  await UserService.update({
                    id: contact.id,
                    Image: userImage ? decode(userImage) : undefined,
                    LastUpdate: new Date(userDate),
                    Name: userName,
                  });
                  this.navigation.setParams({ time: new Date().toTimeString() });
                } catch (err) {
                  console.log(err);
                }
              }
            }
            if (getInfo === true) {
              this.rtcConnection?.sendMessageToPeer(peerId, {
                type: PeerMessageType.UpdateContact,
                userId: this.user?.id,
                userName: this.user?.Name,
                userDate: this.user?.LastUpdate,
                userImage: this.user?.Image ? encode(this.user?.Image) : null,
              });
            }
            break;
          case PeerMessageType.Ping:
            this.rtcConnection?.closeSocket();
            this.navigation.setParams({ contactId: peerId, status: 'online' });
            const data: any = { type: PeerMessageType.Pong };

            if (userId) {
              const contact = UserService.getContactById(userId);
              if (contact?.LastUpdate != new Date(mydate)) {
                data.getInfo = true;
              }
              if (this.user?.LastUpdate != new Date(udate)) {
                data.userId = this.user?.id;
                data.userName = this.user?.Name;
                data.userDate = this.user?.LastUpdate;
                data.userImage = this.user?.Image ? encode(this.user?.Image) : null;
              }
            }
            this.rtcConnection?.sendMessageToPeer(peerId, data);
            break;
          case PeerMessageType.UpdateContact:
            if (userId) {
              const contact = UserService.getContactById(userId);
              if (contact) {
                try {
                  await UserService.update({
                    id: contact.id,
                    Image: userImage ? decode(userImage) : undefined,
                    LastUpdate: new Date(userDate),
                    Name: userName,
                  });
                  this.navigation.setParams({ time: new Date().toTimeString() });
                } catch (err) {
                  console.log(err);
                }
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
      // if (msg.type && (msg.type == 'connection' || 'peers')) {
      //   try {
      //     this.navigation.setParams({ contactId: msg.contactId, status: msg.status });
      //   } catch {}
      // } else {
      //   console.log('type null', msg);
      // }
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
