// kelp - Server
import 'dotenv/config';
import path from 'path';
import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as SocketIO from 'socket.io';
import fs from 'fs-extra';
import SocketServer from './server/socket/socket';
import { execSync } from 'child_process';

// Get version and commit.
const version: string = fs.readJsonSync(path.join(__dirname, '../package.json')).version;
const gitCommit: string = execSync('git rev-parse HEAD').toString().trim();

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

  // Start socket server
  const socketManager: any = new SocketServer(io);

  // Set `./streams` as a static folder
  app.use('/streams', express.static(path.join(__dirname, './.streams')));

  // Used for a commit hook. Checks if theres rooms open, if so then it won't restart and check later.
  app.get('/status', (req, res) => {
    res.send({
      rooms: socketManager.Rooms.getRoomList().length,
      version: version,
      commit: gitCommit || undefined,
    });
  });

  // Direct any other path to next.js
  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});