import {
  EventOnAddStream,
  EventOnCandidate,
  MediaStream,
  RTCDataChannel,
  RTCIceCandidate,
  RTCIceCandidateType,
  RTCOfferOptions,
  RTCPeerConnection,
  RTCPeerConnectionConfiguration,
  RTCSessionDescriptionType,
} from 'react-native-webrtc';
import { UserService } from '../Services';

export class RtcClient {
  constructor(id: string) {
    this.preparePeer(id);
  }

  private peer?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private streamChannel?: RTCDataChannel;
  public onCandidate: (ice: RTCIceCandidateType) => void;
  public onReceiveStream: (stream: MediaStream) => void;
  public onMessage: (event: any) => void;
  public onDataChannelOpen: (event: any) => void;

  private rtcOptions: RTCPeerConnectionConfiguration | any = {
    offerExtmapAllowMixed: false,
  };

  private offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  };

  private preparePeer(id: string) {
    this.peer = new RTCPeerConnection(this.rtcOptions);
    this.dataChannel = this.peer.createDataChannel('data');
    this.streamChannel = this.peer.createDataChannel('stream');

    this.dataChannel.onmessage = (event) => {
      if (this.onMessage) {
        this.onMessage(JSON.parse(event.data));
      }
    };
    const user = UserService.getSystemUser();

    this.peer.onicecandidate = this.onIceCandidate.bind(this);
    this.peer.oniceconnectionstatechange = (event) => {
      if (event.target.iceConnectionState === 'connected' && this.onDataChannelOpen) {
        this.onDataChannelOpen(event);
      }
      console.log(user?.Name, 'oniceconnectionstatechange', event.target.iceConnectionState);
    };
    this.peer.onconnectionstatechange = () => {
      console.log(user?.Name, 'onconnectionstatechange', this.peer?.signalingState);
    };
  }

  private onIceCandidate(ev: EventOnCandidate) {
    if (ev.candidate && ev.candidate.candidate && this.onCandidate) {
      this.onCandidate(ev.candidate);
    }
  }

  public async connectPeer(): Promise<RTCSessionDescriptionType | undefined> {
    let offer;
    if (this.peer) {
      offer = await this.peer.createOffer(this.offerOptions);
      this.peer.onaddstream = (ev: EventOnAddStream) => {
        if (this.onReceiveStream) {
          this.onReceiveStream(ev.stream);
        }
      };

      await this.peer.setLocalDescription(offer);
    }
    return offer;
  }

  public async addCandidate(ice: RTCIceCandidateType) {
    if (this.peer) {
      let candidate = new RTCIceCandidate(ice);
      await this.peer.addIceCandidate(candidate);
    }
  }

  public addStream(strm: MediaStream) {
    if (this.peer) {
      this.peer.addStream(strm);
    }
  }

  public async createAnswer(
    data: RTCSessionDescriptionType
  ): Promise<RTCSessionDescriptionType | undefined> {
    let answer;
    if (this.peer) {
      await this.peer.setRemoteDescription(data);
      answer = await this.peer.createAnswer(this.offerOptions);
      await this.peer.setLocalDescription(answer);
    }
    return answer;
  }

  public async setAnswer(data: RTCSessionDescriptionType) {
    if (this.peer) {
      await this.peer.setRemoteDescription(data);
    }
  }

  public sendDataMessage(data: any) {
    if (this.dataChannel) {
      this.dataChannel.send(JSON.stringify({ data }));
    }
  }

  public close() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.streamChannel) this.streamChannel.close();
    if (this.peer) this.peer.close();
    this.peer = undefined;
    this.dataChannel = undefined;
    this.streamChannel = undefined;
  }
}
