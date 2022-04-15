import express, { Request, Response, Router } from 'express';
import userAuth from '../middlewares/userAuth';
import { processId } from '../util/textProcess';
import MessageService from '../services/Message';

const router: Router = express.Router();

router.post('/message', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const from = processId(req.data.id);
  const to = processId(req.body.to);
  const { message } = req.body;
  let { test } = req.body;

  if (test === undefined) {
    test = false;
  } else {
    test = true;
  }

  // if (from === undefined || to === undefined || message === undefined || message === '') {

  // eslint-disable-next-line eqeqeq
  if (from == undefined || to == undefined || message == undefined || message == '') {
    return res.sendStatus(400);
  }

  const newMessage = await MessageService.Create({ message, from, to, test });
  return res.json(newMessage);
});

router.get('/messages', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const id = processId(req.data.id);

  const messagesAllUsers = await MessageService.FindAllMessages(id);
  return res.json(messagesAllUsers);
});

router.get('/message/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const id1 = processId(req.data.id);
  const id2 = processId(req.params.id);

  const messagesAllUsers = await MessageService.FindAllMessagesInUsers(id1, id2);

  return res.json(messagesAllUsers);
});

router.get('/messages/users', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const id = processId(req.data.id);

  const listUsers = await MessageService.FindAllUsersOnePersonCanSendMessage(id);

  // Todas as pessoas que o dono segue + pessoas que ele enviou ou recebeu mensagem!
  return res.json(listUsers);
});

export default router;
