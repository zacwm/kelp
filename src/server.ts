// kelp - Server
import 'dotenv/config';
import path from 'path';
import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as SocketIO from 'socket.io';
import fs from 'fs-extra';
import SocketServer from './socket';

const port: number = +process.env.PORT || 3000;
const nextApp = next({ dev: process.env.NODE_ENV !== 'production', hostname: 'localhost', port });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
  await fs.emptyDir(path.join(__dirname, './.temp'));
  await fs.emptyDir(path.join(__dirname, './.streams'));
  
  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: SocketIO.Server = new SocketIO.Server();
  
  app.use(express.static(path.join(__dirname, './public')));
  io.attach(server);

  new SocketServer(io);

  app.use('/streams', express.static(path.join(__dirname, './.streams')));

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});