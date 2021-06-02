import { Invite } from '@models';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import ws from 'ws';
import { RealmService } from '../realm/RealmService';

interface ChannelList {
  [key: string]: {
    [key: string]: { socket: ws; type?: string; isAlive?: boolean; interval?: any };
  };
}
export class SocketService {
  static wsServer: ws.Server;
  static channelList: ChannelList;
  static inviteRepo: RealmService<Invite>;

  public static init(server: http.Server | https.Server) {
    this.wsServer = new ws.Server({
      server: server,
    });
    this.wsServer.on('connection', this.onConnection.bind(this));
    this.channelList = {};
    this.inviteRepo = new RealmService<Invite>('Invite');

    this.inviteRepo.addListener((collection, changes) => {
      console.log('invite changes', changes);
    });
  }

  private static onConnection(socket: ws, request: http.IncomingMessage) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathParams: string[] = url.pathname.split('/').filter((x) => x.length > 0);
    const contactId = pathParams[0];
    let channelId = pathParams.reverse().join('');
    if (!SocketService.channelList[channelId]) {
      channelId = pathParams.reverse().join('');
    }
    if (!SocketService.channelList[channelId]) {
      SocketService.channelList[channelId] = {};
    }

    Object.keys(SocketService.channelList[channelId]).forEach((x) => {
      socket.send(JSON.stringify({ type: 'peers', status: 'online', contactId: x, offer: true }));
    });

    SocketService.channelList[channelId][contactId] = { type: '', socket: socket, isAlive: true };
    console.log(
      Object.keys(SocketService.channelList).map((x) => {
        return {
          channelId: x,
          contacts: Object.keys(SocketService.channelList[x]),
        };
      })
    );

    // SocketService.sendTo({ type: 'connection', status: 'online', contactId }, channelId, null, [
    //   contactId,
    // ]);

    socket.addListener('message', SocketService.onMessage.bind(socket, channelId, contactId));
    socket.addListener('close', SocketService.onClose.bind(socket, channelId, contactId));
    socket.addListener('error', SocketService.onClose.bind(socket, channelId, contactId));
    socket.addListener('pong', SocketService.pong.bind(socket, channelId, contactId));

    // SocketService.channelList[channelId][contactId].interval = setInterval(
    //   SocketService.interval.bind(socket, channelId, contactId),
    //   1000
    // );
  }

  private static ping() {}

  private static interval(channelId: string, contactId: string) {
    if (SocketService.channelList[channelId] && SocketService.channelList[channelId][contactId]) {
      if (SocketService.channelList[channelId][contactId].isAlive === false) {
        if (SocketService.channelList[channelId][contactId].interval) {
          clearInterval(SocketService.channelList[channelId][contactId].interval);
        }
        return SocketService.channelList[channelId][contactId].socket.terminate();
      }

      SocketService.channelList[channelId][contactId].isAlive = false;
      if (
        SocketService.channelList[channelId][contactId].socket.readyState ==
        SocketService.channelList[channelId][contactId].socket.OPEN
      ) {
        SocketService.channelList[channelId][contactId].socket.ping(SocketService.ping);
      }
    }
  }

  private static pong(channelId: string, contactId: string) {
    if (SocketService.channelList[channelId] && SocketService.channelList[channelId][contactId]) {
      SocketService.channelList[channelId][contactId].isAlive = true;
    }
  }

  private static onMessage(channelId: string, contactId: string, message: ws.Data) {
    try {
      const data = JSON.parse(message.toString());
      SocketService.sendTo(data, channelId, data.to, [contactId]);
    } catch (err) {
      console.error(err);
    }
  }

  private static onClose(channelId: string, contactId: string, code: any) {
    if (SocketService.channelList[channelId]) {
      SocketService.channelList[channelId][contactId] = null;
      delete SocketService.channelList[channelId][contactId];

      if (Object.keys(SocketService.channelList[channelId]).length == 0) {
        delete SocketService.channelList[channelId];
      }
      // SocketService.sendTo(
      //   { type: 'connection', status: 'offline', contactId: contactId },
      //   channelId
      // );
    }
    console.log(
      'close',
      Object.keys(SocketService.channelList).map((x) => {
        return {
          channelId: x,
          contacts: Object.keys(SocketService.channelList[x]),
        };
      })
    );
  }

  public static sendTo(message: any, channelId: string, contactId?: string, ignore?: string[]) {
    if (channelId && SocketService.channelList[channelId]) {
      if (!contactId) {
        const contacts = Object.keys(SocketService.channelList[channelId]).filter(
          (x) => !ignore || ignore.indexOf(x) == -1
        );
        for (let index = 0; index < contacts.length; index++) {
          const conId = contacts[index];
          const socket = SocketService.channelList[channelId][conId].socket;

          if (socket && socket.readyState == socket.OPEN) {
            socket.send(JSON.stringify(message));
          }
        }
      } else if (SocketService.channelList[channelId][contactId]) {
        const socket = SocketService.channelList[channelId][contactId].socket;

        if (socket && socket.readyState == socket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      }
    }
  }

  // public static sendAll(data: any, exclude: string[] = []) {
  //   Object.keys(SocketService.clients)
  //     .filter((x) => exclude.indexOf(x) == -1)
  //     .forEach((x) => {
  //       SocketService.sendTo(x, data);
  //     });
  // }
}
