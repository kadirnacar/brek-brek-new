export class RtcConnection {
  constructor(private serverUrl: string) {}

  private socket: WebSocket;
  private socketId: string;
  private peers: { [peerId: string]: any } = {};

  public onMessage: (message: any) => void;

  public getClientId() {
    return this.socketId;
  }

  public async connectServer() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onclose = this.disconnectServer;
      this.socket.onerror = this.disconnectServer;

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
      const data = JSON.parse(ev.data);
      switch (data.type) {
        case 'connection':
          this.socketId = data.clientId;
          if (succCallback) {
            succCallback();
          }
          break;
        case 'rtc':
          await this.onRtcEvent(data);
          break;
        default:
          if (this.onMessage) {
            this.onMessage(data);
          }
          break;
      }
    } catch (err) {
      console.error(err);
      if (errCallback) {
        errCallback(err);
      }
    }
  }

  private async onRtcEvent(data: any) {
    switch (data.data.type) {
      case 'iceCandidate':
        const peerIce = this.peers[data.from];
        if (peerIce) {
          peerIce.addCandidate(data.data.candidate);
        }
        break;
      case 'offer':
        const newPeer = this.createPeer(data.from);
        const answer = await newPeer.createAnswer(data.data);
        this.socket.send(
          JSON.stringify({ to: data.from, from: this.socketId, type: 'rtc', data: answer })
        );
        break;
      case 'answer':
        const peerAnswer = this.peers[data.from];
        if (peerAnswer) {
          await peerAnswer.setAnswer(data.data);
        }
        break;
      default:
        break;
    }
  }

  public disconnectServer(ev: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socketId = '';
    this.peers = {};
    console.log(ev);
  }

  private createPeer(peerId: string) {
    const peer: any = {}; //new RtcClient();

    peer.onCandidate = (ice: any) => {
      this.socket.send(
        JSON.stringify({
          to: peerId,
          from: this.socketId,
          type: 'rtc',
          data: { type: 'iceCandidate', candidate: ice },
        })
      );
    };

    this.peers[peerId] = peer;
    return peer;
  }

  public async connectToPeer(peerId: string) {
    this.createPeer(peerId);
    const peer = this.peers[peerId];
    const offer = await peer.connectPeer();
    this.socket.send(JSON.stringify({ to: peerId, from: this.socketId, type: 'rtc', data: offer }));
  }
}
