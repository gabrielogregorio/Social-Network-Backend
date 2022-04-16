/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import userAuth from '../middlewares/userAuth';
import PostService from '../services/Post';
import CommentService from '../services/Comment';
import { processId } from '../util/textProcess';

dotenv.config();

const router = express.Router();

router.get('/post/comments/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  const comments = await CommentService.FindByPosts(id);
  return res.json(comments);
});

router.post('/post/comment/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);
  const { replie } = req.body;
  const { text } = req.body;

  if (text === '' || id === '' || user === '' || id === undefined || user === undefined || text === undefined) {
    return res.sendStatus(400);
  }
  try {
    if (replie !== undefined) {
      const newComment = await CommentService.Create({ post: id, user, text, replie });

      const originalComment = await CommentService.FindById(replie);
      originalComment.replies.push(newComment);
      await originalComment.save();

      return res.json({ id: newComment.id, replie: originalComment._id });
    }
    // @ts-ignore
    const newComment = await CommentService.Create({ post: id, user, text, base: true });

    const post = await PostService.FindById(id);
    post.comments.push(newComment);
    // @ts-ignore
    await post.save();

    return res.json({ id: newComment.id });
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.delete('/post/comment/:idComment', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.idComment);
  // @ts-ignore
  const user = processId(req.data.id);

  if (id === undefined || user === undefined) {
    return res.sendStatus(400);
  }

  try {
    await CommentService.DeleteOne(id, user);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.put('/post/comment/:idComment', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.idComment);
  // @ts-ignore
  const user = processId(req.data.id);
  const { text } = req.body;

  if (text === '' || id === '' || user === '' || id === undefined || user === undefined || text === undefined) {
    return res.sendStatus(400);
  }

  try {
    const comment = await CommentService.FindOneAndUpdate(id, user, { text });
    if (comment === null) {
      return res.sendStatus(404);
    }

    return res.json({ oi: 'ola' });
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default router;
