import { NavigationContainerRef } from '@react-navigation/core';
import { NativeModules } from 'react-native';
import { Users } from '../Models';
import { UserService } from '../Services';
import { config } from './config';
import { IHelperModule } from './IHelperModule';
import { RtcConnection } from './RtcConnection';

const HelperModule: IHelperModule = NativeModules.HelperModule;

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

  public startRecord() {
    HelperModule.startRecord();
  }

  public stopRecord() {
    HelperModule.stopRecord();
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
          this.rtcConnection.sendMessage({
            to: message.peerId,
            from: this.user?.refId,
            ...message.data,
          });
        }
      }
    }
  }

  private async startRtcConnection(channelId: string) {
    this.rtcConnection = new RtcConnection(`${config.socketUrl}/${channelId}`);

    this.rtcConnection.connectServer(true);
    this.rtcConnection.onMessage = async (msg) => {
      if (msg.type && msg.type == 'connection') {
        this.navigation.setParams({ contactId: msg.contactId, status: msg.status });
      } else if (msg.type && msg.type == 'peers') {
        this.navigation.setParams({ contactId: msg.contactId, status: msg.status });
        if (msg.offer == true) {
          await HelperModule.createPeer(msg.contactId);
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
