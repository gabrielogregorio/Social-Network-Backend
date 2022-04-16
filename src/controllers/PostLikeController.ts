import express, { Response, Router } from 'express';
import dotenv from 'dotenv';
import { ILike } from '@/models/Like';
import { IPost } from '@/models/Post';
import { MiddlewareRequest } from '@/interfaces/extends';
import userAuth from '@/middlewares/userAuth';
import LikeService from '@/services/likeService';
import PostService from '@/services/postService';
import { processId } from '@/util/textProcess';
import STATUS_CODE from '@/handlers/index';

const postLikeController: Router = express.Router();
dotenv.config();

postLikeController.post(
  '/post/like/:id',
  userAuth,
  async (req: MiddlewareRequest, res: Response): Promise<Response> => {
    const id: string = processId(req.params.id);
    const user: string = processId(req.data.id);
    try {
      const likeExistents: ILike = await LikeService.FindLike(id, user);

      if (likeExistents) {
        await LikeService.DeleteLike(id, user);

        const post: IPost = await PostService.FindById(id);

        post.likes = post.likes.filter((like) => like.toString() !== likeExistents?._id.toString());
        await post.save();

        return res.json({ includeLike: false });
      }
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }

    try {
      const newLike: ILike = await LikeService.Create(id, user);
      const post: IPost = await PostService.FindById(id);

      post.likes.push(newLike._id);
      await post.save();

      return res.json({ includeLike: true });
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
  },
);

export default postLikeController;
