import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import ws from 'ws';

export class SocketService {
  static wsServer: ws.Server;
  static clients: { [id: string]: { socket: ws; type?: string } } = {};

  public static async init(server: http.Server | https.Server) {
    this.wsServer = new ws.Server({
      server: server,
    });
    this.wsServer.on('connection', this.onConnection.bind(this));
  }

  private static onConnection(socket: ws, request: http.IncomingMessage) {
    const params = new Map(
      new URL(request.url, `http://${request.headers.host}`).searchParams.entries()
    );
    const clientId: any = params.get('clientId');
    SocketService.clients[clientId] = { socket: socket };

    params.forEach((val: any, key: any) => {
      SocketService.clients[clientId][key] = val;
    });

    SocketService.clients[clientId].socket.send(
      JSON.stringify({ type: 'connection', clientId, success: true })
    );

    SocketService.sendAll({
      type: 'clients',
      data: Object.keys(SocketService.clients).map((x) => ({
        type: SocketService.clients[x]['type'],
        clientId: x,
      })),
    });

    SocketService.clients[clientId].socket.onmessage = (message: ws.MessageEvent) => {
      const data = JSON.parse(message.data.toString());
      SocketService.clients[data.to].socket.send(message.data);
    };

    SocketService.clients[clientId].socket.on('close', (code, reason) => {
      delete SocketService.clients[clientId];
      SocketService.sendAll({
        type: 'clients',
        data: Object.keys(SocketService.clients).map((x) => ({
          type: SocketService.clients[x]['type'],
          clientId: x,
        })),
      });
    });
  }

  public static sendAll(data: any, exclude: string[] = []) {
    Object.keys(SocketService.clients)
      .filter((x) => exclude.indexOf(x) == -1)
      .forEach((x) => {
        SocketService.clients[x].socket.send(JSON.stringify(data));
      });
  }
}
