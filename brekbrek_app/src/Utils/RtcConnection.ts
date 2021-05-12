export class RtcConnection {
  constructor(private serverUrl: string) {}

  private socket: WebSocket;
  private socketId: string;

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

  public sendMessage(to: string, message: any) {
    this.socket.send(JSON.stringify({ to: to, from: this.socketId, ...message }));
  }

  public disconnectServer(ev: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socketId = '';
    console.log('disconnected', ev);
  }
}
