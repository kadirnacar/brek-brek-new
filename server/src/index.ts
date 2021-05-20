import { LoggerService, SocketService } from '@services';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import 'reflect-metadata';
import App from './server';

LoggerService.init();

const port = process.env.PORT || 3001;
App.set('port', port);

const httpsOptions = {
  cert: fs.readFileSync('./certificate.crt'),
  ca: fs.readFileSync('./ca_bundle.crt'),
  key: fs.readFileSync('./private.key'),
};

const server = http.createServer(App);
// const server = https.createServer(httpsOptions, App);
server.listen(port);
SocketService.init(server);

const onError = (error) => {
  LoggerService.logger.error(error);
  console.log(error);
  if (error.syscall !== 'listen') throw error;
  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  let addr = server.address();
  let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  LoggerService.logger.info(`Listening on ${bind}`);
};

server.on('error', onError);
server.on('listening', onListening);
