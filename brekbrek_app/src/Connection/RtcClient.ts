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

export class RtcClient {
  constructor(id: string) {
    this.preparePeer(id);
  }

  private peer: RTCPeerConnection;
  private channel: RTCDataChannel;
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
    this.channel = this.peer.createDataChannel(id);

    this.channel.onopen = (event) => {
      if (this.onDataChannelOpen) {
        this.onDataChannelOpen(event);
      }
    };

    this.channel.onmessage = (event) => {
      if (this.onMessage) {
        this.onMessage(event);
      }
    };

    this.peer.onicecandidate = this.onIceCandidate.bind(this);
  }

  private onIceCandidate(ev: EventOnCandidate) {
    if (ev.candidate && ev.candidate.candidate && this.onCandidate) {
      this.onCandidate(ev.candidate);
    }
  }

  public async connectPeer(): Promise<RTCSessionDescriptionType> {
    const offer = await this.peer.createOffer(this.offerOptions);
    this.peer.onaddstream = (ev: EventOnAddStream) => {
      if (this.onReceiveStream) {
        this.onReceiveStream(ev.stream);
      }
    };

    await this.peer.setLocalDescription(offer);
    return offer;
  }

  public async addCandidate(ice: RTCIceCandidateType) {
    let candidate = new RTCIceCandidate(ice);
    await this.peer.addIceCandidate(candidate);
  }

  public addStream(strm: MediaStream) {
    this.peer.addStream(strm);
  }

  public async createAnswer(data: RTCSessionDescriptionType): Promise<RTCSessionDescriptionType> {
    await this.peer.setRemoteDescription(data);
    const answer = await this.peer.createAnswer(this.offerOptions);
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  public async setAnswer(data: RTCSessionDescriptionType) {
    await this.peer.setRemoteDescription(data);
  }
  private str2ab(str: string) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  public sendDataMessage(data: any) {
    this.channel.send(JSON.stringify({ data }));
  }
  public close() {
    this.channel.close();
    this.peer.close();
  }
}
