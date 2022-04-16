/* eslint-disable no-underscore-dangle */
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import userAuth from '../middlewares/userAuth';
import PostService from '../services/Post';
import { processId } from '../util/textProcess';

dotenv.config();

const router = express.Router();

router.post('/post/share/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const user = processId(req.data.id);
  const idPost = processId(req.params.id);

  // Cria o novo post referenciando o post que será compartilhado
  // @ts-ignore
  const newPostSave = PostService.Create({ user, sharePost: idPost });

  const sharedPost = await PostService.FindById(idPost);
  // @ts-ignore
  sharedPost.thisReferencesShared.push(newPostSave._id);
  // @ts-ignore
  await sharedPost.save();
  // @ts-ignore
  return res.json({ _id: newPostSave._id, user, shared: idPost });
});

export default router;
