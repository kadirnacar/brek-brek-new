export class RtcConnection {
  constructor(private serverUrl: string) {}

  private socket: WebSocket;
  private socketId: string;
  private disconnected: boolean = false;

  public onMessage: (message: any) => void;

  public getClientId() {
    return this.socketId;
  }

  public async connectServer(isNew?: boolean) {
    if (isNew) {
      this.disconnected = false;
    }
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);
      this.socket.onclose = this.onDisconnectServer.bind(this);
      this.socket.onerror = this.onErrorServer.bind(this);
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
    if (this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ to: to, from: this.socketId, ...message }));
      } catch {}
    }
  }

  private async onErrorServer(ev: any) {
    this.socket.onclose = null;
    this.socket.onerror = null;
    this.socket.onmessage = null;

    if (!this.disconnected) {
      console.info('error', ev);
      await this.connectServer();
    }
  }

  private async onDisconnectServer(ev: any) {
    console.info('disconnected', ev);
    // await this.connectServer();
  }

  public disconnectServer(ev: any) {
    this.disconnected = true;
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socketId = '';
    }
  }
}
