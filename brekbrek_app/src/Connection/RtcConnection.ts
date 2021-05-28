import { MediaStream, RTCIceCandidateType, RTCSessionDescriptionType } from 'react-native-webrtc';
import { Users } from '../Models';
import { UserService } from '../Services';
import { RtcClient } from './RtcClient';

export class RtcConnection {
  constructor(private serverUrl: string) {
    this.user = UserService.getSystemUser();
  }

  private user?: Users;
  private socket: WebSocket;
  private socketId: string;
  private peers: { [peerId: string]: RtcClient } = {};

  public onReceiveStream: (clientId: string, stream: MediaStream) => void;

  public onMessage: (message: any) => Promise<void>;

  public getClientId() {
    return this.socketId;
  }

  public async connectServer() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onclose = this.disconnectServer.bind(this);
      this.socket.onerror = this.disconnectServer.bind(this);

      this.socket.onmessage = async (ev) => {
        await this.onSocketMessage(
          ev,
          () => resolve(null),
          (err: any) => reject(err)
        );
      };
    });
  }

  private async onSocketMessage(
    ev: WebSocketMessageEvent,
    succCallback?: () => void,
    errCallback?: (err: any) => void
  ) {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type) {
        switch (msg.type.toLowerCase()) {
          case 'peers':
            if (msg.offer) {
              await this.connectToPeer(msg.contactId);
            }
            if (this.onMessage) {
              await this.onMessage(msg);
            }
            break;
          case 'offer':
            const newPeer = this.createPeer(msg.from);
            // newPeer.addStream(this.stream);
            const answer = await newPeer.createAnswer(msg.data);
            this.socket.send(
              JSON.stringify({ to: msg.from, from: this.user?.refId, type: 'answer', data: answer })
            );
            break;
          case 'answer':
            const peerAnswer = this.peers[msg.from];
            if (peerAnswer) {
              await peerAnswer.setAnswer(msg.data);
            }
            break;
          case 'candidate':
            const peerIce = this.peers[msg.from];
            if (peerIce) {
              await peerIce.addCandidate(msg.candidate);
            }
            break;
          default:
            if (this.onMessage) {
              this.onMessage(msg);
            }
            break;
        }
      }
    } catch (err) {
      console.error(err);
      if (errCallback) {
        errCallback(err);
      }
    }
  }

  public disconnectServer() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socketId = '';
    Object.keys(this.peers).forEach((x) => {
      this.peers[x].close();
    });
    this.peers = {};
  }

  private createPeer(peerId: string) {
    const peer = new RtcClient(peerId);

    peer.onCandidate = (ice: RTCIceCandidateType) => {
      this.socket.send(
        JSON.stringify({
          to: peerId,
          from: this.user?.refId,
          type: 'candidate',
          candidate: ice,
        })
      );
    };

    peer.onMessage = (event: any) => {
      
    };

    peer.onReceiveStream = (stream: MediaStream) => {
      if (this.onReceiveStream) {
        this.onReceiveStream(peerId, stream);
      }
    };
    this.peers[peerId] = peer;
    return peer;
  }

  public sendMessage(message: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
      } catch {}
    }
  }

  public async connectToPeer(peerId: string) {
    this.createPeer(peerId);
    const peer = this.peers[peerId];
    const offer = await peer.connectPeer();

    this.socket.send(
      JSON.stringify({ to: peerId, from: this.user?.refId, type: 'offer', data: offer })
    );
  }

  public sendDataMessage(data: any) {
    Object.keys(this.peers).forEach((x) => {
      this.peers[x].sendDataMessage(data);
    });
  }
}
