import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import ws from 'ws';

export class SocketService {
  static wsServer: ws.Server;
  static clients: { [id: string]: { socket: ws; type?: string } } = {};

  public static init(server: http.Server | https.Server) {
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
console.log(request.url)
    if (!clientId) {
      socket.terminate();
      return;
    }

    socket.on('message', SocketService.onMessage.bind(socket));
    socket.on('close', SocketService.onClose.bind(socket, clientId));
    socket.on('error', SocketService.onClose.bind(socket, clientId));

    SocketService.clients[clientId] = { socket: socket };

    params.forEach((val: any, key: any) => {
      SocketService.clients[clientId][key] = val;
    });

    SocketService.sendTo(clientId, { type: 'connection', clientId, success: true });

    SocketService.sendAll({
      type: 'clients',
      data: Object.keys(SocketService.clients).map((x) => ({
        type: SocketService.clients[x]['type'],
        clientId: x,
      })),
    });
  }

  private static onMessage(message: ws.Data) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data,'');
      SocketService.sendTo(data.to, data);
    } catch (err) {
      console.error(err);
    }
  }

  private static onClose(clientId, code, reason) {
    if (clientId) {
      delete SocketService.clients[clientId];
      SocketService.sendAll({
        type: 'clients',
        data: Object.keys(SocketService.clients).map((x) => ({
          type: SocketService.clients[x]['type'],
          clientId: x,
        })),
      });
    }
  }

  public static sendTo(clientId: string, data: any) {
    if (
      clientId &&
      SocketService.clients[clientId] &&
      SocketService.clients[clientId].socket.readyState === ws.OPEN
    ) {
      SocketService.clients[clientId].socket.send(JSON.stringify(data));
    } else if (
      clientId &&
      SocketService.clients[clientId] &&
      SocketService.clients[clientId].socket.readyState !== ws.OPEN
    ) {
      delete SocketService.clients[clientId];
    }
  }

  public static sendAll(data: any, exclude: string[] = []) {
    Object.keys(SocketService.clients)
      .filter((x) => exclude.indexOf(x) == -1)
      .forEach((x) => {
        SocketService.sendTo(x, data);
      });
  }
}
