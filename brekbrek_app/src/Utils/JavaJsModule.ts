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

  public startRecord() {
    HelperModule.startRecord();
    this.rtcConnection?.sendDataMessage('bastı');
  }

  public stopRecord() {
    // HelperModule.stopRecord();
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
    this.rtcConnection = new RtcConnection(`${config.socketUrl}/${channelId}`);

    this.rtcConnection.connectServer();
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
      this.rtcConnection = undefined;
    }
  }
}
export default JavaJsModule.getInstance();
