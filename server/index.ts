import express from 'express';
import * as http from 'http';
import ws from 'ws';
import { uuidv4 } from '../tools';
import { URL } from 'url';

const server = http.createServer(express);
const wsServer = new ws.Server({ server });
const clients: { [id: string]: { socket: ws; type?: string } } = {};

wsServer.on('connection', (socket: ws, request: http.IncomingMessage) => {
  const params = new Map(new URL(request.url, `http://${request.headers.host}`).searchParams.entries());
  const clientId = params.get('clientId');
  clients[clientId] = { socket: socket };

  params.forEach((val, key) => {
    clients[clientId][key] = val;
  });

  clients[clientId].socket.send(JSON.stringify({ type: 'connection', clientId, success: true }));

  sendAll({ type: 'clients', data: Object.keys(clients).map((x) => ({ type: clients[x]['type'], clientId: x })) });

  clients[clientId].socket.onmessage = (message: ws.MessageEvent) => {
    const data = JSON.parse(message.data.toString());
    clients[data.to].socket.send(message.data);
  };

  clients[clientId].socket.on('close', (code, reason) => {
    delete clients[clientId];
    sendAll({ type: 'clients', data: Object.keys(clients).map((x) => ({ type: clients[x]['type'], clientId: x })) });
  });
});

const sendAll = (data: any, exclude: string[] = []) => {
  Object.keys(clients)
    .filter((x) => exclude.indexOf(x) == -1)
    .forEach((x) => {
      clients[x].socket.send(JSON.stringify(data));
    });
};

server.listen(3005);
