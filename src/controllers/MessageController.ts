import express, { Response, Router } from 'express';
import { IMessage } from '@/models/Message';
import userAuth from '@/middlewares/userAuth';
import { processId } from '@/util/textProcess';
import MessageService from '@/services/messageService';
import { MiddlewareRequest } from '@/interfaces/extends';
import STATUS_CODE from '@/handlers/index';

const messageController: Router = express.Router();

messageController.post('/message', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const from: string = processId(req.data.id);
  const to: string = processId(req.body.to);
  const { message }: { message: string } = req.body;
  const { test }: { test: boolean } = req.body;

  if (from && to && message) {
    const newMessage: IMessage = await MessageService.Create({ message, from, to, test: !!test });
    return res.json(newMessage);
  }

  return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
});

messageController.get('/messages', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const id = processId(req.data.id);

  const messagesAllUsers: IMessage[] = await MessageService.FindAllMessages(id);
  return res.json(messagesAllUsers);
});

messageController.get('/message/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const id1 = processId(req.data.id);
  const id2 = processId(req.params.id);

  const messagesAllUsers: IMessage[] = await MessageService.FindAllMessagesInUsers(id1, id2);

  return res.json(messagesAllUsers);
});

messageController.get('/messages/users', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const id = processId(req.data.id);

  const listUsers: any[] = await MessageService.FindAllUsersOnePersonCanSendMessage(id);

  return res.json(listUsers);
});

export default messageController;
