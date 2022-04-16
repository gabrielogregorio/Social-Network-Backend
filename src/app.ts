import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import http from 'http';
import WebSocket from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import { v4 } from 'uuid';
import Post from '@/models/Post';
import User from '@/models/User';
import UserController from '@/controllers/UserController';
import PostCommentController from '@/controllers/PostCommentController';
import PostController from '@/controllers/PostController';
import MessageController from '@/controllers/MessageController';
import PostLikeController from '@/controllers/PostLikeController';
import PostShareController from '@/controllers/PostShareController';
import userAuth from '@/middlewares/userAuth';
import { MiddlewareRequest } from 'src/interfaces/extends';
import STATUS_CODE from '@/handlers/index';

const app: Application = express();

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });

dotenv.config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

app.use('/', UserController);
app.use('/', PostController);
app.use('/', MessageController);
app.use('/', PostCommentController);
app.use('/', PostShareController);
app.use('/', PostLikeController);

mongoose
  .connect(process.env.DB_MONGO_URI, {})
  .then(() => null)
  .catch((error) => error);

const sockets = {};

websocketServer.on('connection', (webs) => {
  const webSocketClient = webs;

  const socketUuid = `${v4()}`;

  sockets[socketUuid] = { socket: webSocketClient, user: null };

  webSocketClient.send(JSON.stringify({ type: 'connected', socketUuid }));

  webSocketClient.onclose = () => {
    Object.keys(sockets).forEach((item) => {
      if (sockets[item].socket === webSocketClient) {
        delete sockets[item];
      }
    });
  };

  return webSocketClient;
});

app.post('/connectSocket', userAuth, (req: MiddlewareRequest, res: Response): Response => {
  const idUser = req.data.id;
  const { socketUuid } = req.body;

  sockets[socketUuid].user = idUser;
  return res.sendStatus(STATUS_CODE.SUCCESS);
});

app.post('/sendMessageUser', userAuth, (req: Request, res: Response): Response => {
  const { to } = req.body;
  const { from } = req.body;
  const { message } = req.body;

  Object.keys(sockets).forEach((item) => {
    if (sockets[item].user === to) {
      sockets[item].socket.send(
        JSON.stringify({
          type: 'RECIVE_MESSAGE',
          from,
          message,
        }),
      );
    }
  });

  return res.sendStatus(STATUS_CODE.SUCCESS);
});

app.post('/validate', userAuth, (req: Request, res: Response): Response => res.sendStatus(STATUS_CODE.SUCCESS));

app.get('/', (_req: Request, res: Response): Response => res.json({ status: 'API is Running' }));

app.delete('/user/:email', async (req: Request, res: Response): Promise<Response> => {
  try {
    await User.deleteMany({ email: req.params.email });
    return res.sendStatus(STATUS_CODE.SUCCESS);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.SUCCESS);
  }
});

app.delete('/image', async (req: Request, res: Response): Promise<Response> => {
  try {
    await Post.deleteMany({ test: true });
    return res.sendStatus(STATUS_CODE.SUCCESS);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.SUCCESS);
  }
});

export { app, mongoose, server };
