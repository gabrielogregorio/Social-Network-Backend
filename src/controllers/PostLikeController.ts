/* eslint-disable no-underscore-dangle */
import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import { ILike } from '@/models/Like';
import { IPost } from '@/models/Post';
import userAuth from '../middlewares/userAuth';
import LikeService from '../services/likeService';
import PostService from '../services/postService';
import { processId } from '../util/textProcess';

const postLikeController: Router = express.Router();
dotenv.config();

postLikeController.post('/post/like/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);
  try {
    const likeExistents: ILike = await LikeService.FindLike(id, user);

    if (likeExistents) {
      await LikeService.DeleteLike(id, user);

      const post: IPost = await PostService.FindById(id);

      post.likes = post.likes.filter((like) => like.toString() !== likeExistents?._id.toString());
      // @ts-ignore
      await post.save();

      return res.json({ includeLike: false });
    }
  } catch (error) {
    return res.sendStatus(500);
  }

  try {
    const newLike: ILike = await LikeService.Create(id, user);
    const post: IPost = await PostService.FindById(id);

    post.likes.push(newLike._id);
    // @ts-ignore
    await post.save();

    return res.json({ includeLike: true });
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default postLikeController;
