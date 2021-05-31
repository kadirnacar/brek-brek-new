import { NavigationContainerRef } from '@react-navigation/core';
import { NativeModules } from 'react-native';
import { RtcConnection } from '../Connection/RtcConnection';
import { Users } from '../Models';
import { UserService } from '../Services';
import { config } from './config';
import { IHelperModule } from './IHelperModule';
import {
  RTCView,
  mediaDevices,
  MediaStream,
  MediaStreamConstraints,
  RTCPeerConnection,
} from 'react-native-webrtc';

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

  public async startRecord() {
    this.rtcConnection?.sendDataMessage('bastı');
    // const newStream: any = await mediaDevices.getUserMedia({
    //   audio: true,
    //   video: false,
    // });
    // this.rtcConnection?.addStream(newStream);
  }

  public stopRecord() {
    console.log('stopRecord not implemented');
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
      // HelperModule.registerPlayerListener();
    };

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
    }
    this.rtcConnection = undefined;
  }
}
export default JavaJsModule.getInstance();
