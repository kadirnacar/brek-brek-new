import { NavigationContainerRef } from '@react-navigation/core';
import { NativeModules } from 'react-native';
import { RtcConnection } from '../Connection/RtcConnection';
import { Users } from '../Models';
import { UserService } from '../Services';
import { config } from './config';
import { IHelperModule } from './IHelperModule';

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
    this.rtcConnection?.sendDataMessage({ type: 'speak', status: true });
    await HelperModule.startRecord();
  }

  public async stopRecord() {
    this.rtcConnection?.sendDataMessage({ type: 'speak', status: false });
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

  private async startRtcConnection(channelId: string) {
    this.stopRtcConnection();
    this.rtcConnection = new RtcConnection(`${config.socketUrl}/${channelId}`);

    this.rtcConnection.onPeerConnectionCompleted = async () => {
      await HelperModule.registerPlayerListener();
    };

    this.rtcConnection.connectServer();

    this.rtcConnection.onPeerMessage = async (msg) => {
      if (msg.data && msg.data.type && msg.data.type == 'speak') {
        if (msg.data.status) {
          await HelperModule.startPlay();
        } else {
          await HelperModule.stopPlay();
        }
      } else {
        console.log('onPeerMessage else', msg);
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
