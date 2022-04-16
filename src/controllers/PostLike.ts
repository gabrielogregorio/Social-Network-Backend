/* eslint-disable no-underscore-dangle */
import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import userAuth from '../middlewares/userAuth';
import LikeService from '../services/Like';
import PostService from '../services/Post';
import { processId } from '../util/textProcess';

const router: Router = express.Router();
dotenv.config();

router.post('/post/like/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);
  try {
    const likeExistente = await LikeService.FindLike(id, user);

    // aaaa
    if (likeExistente != null) {
      await LikeService.DeleteLike(id, user);

      const post = await PostService.FindById(id);

      // aaaa
      post.likes = post.likes.filter((value) => value != `${likeExistente._id}`);
      // @ts-ignore
      await post.save();

      return res.json({ includeLike: false });
    }
  } catch (error) {
    return res.sendStatus(500);
  }

  try {
    const newLike = await LikeService.Create(id, user);
    const post = await PostService.FindById(id);

    // @ts-ignore
    post.likes.push(newLike);
    // @ts-ignore
    await post.save();

    return res.json({ includeLike: true });
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default router;
