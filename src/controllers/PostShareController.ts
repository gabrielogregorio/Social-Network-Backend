import express, { Response } from 'express';
import dotenv from 'dotenv';
import { MiddlewareRequest } from 'src/interfaces/extends';
import { IPost } from '@/models/Post';
import userAuth from '@/middlewares/userAuth';
import PostService from '@/services/postService';
import { processId } from '@/util/textProcess';

dotenv.config();

const postShareController = express.Router();

postShareController.post(
  '/post/share/:id',
  userAuth,
  async (req: MiddlewareRequest, res: Response): Promise<Response> => {
    const user: string = processId(req.data.id);
    const idPost: string = processId(req.params.id);

    const newPostSave: IPost = await PostService.Create({ user, sharePost: idPost, body: '', test: false, img: '' });

    const sharedPost: IPost = await PostService.FindById(idPost);
    sharedPost.thisReferencesShared.push(newPostSave);
    await sharedPost.save();

    return res.json({ _id: newPostSave._id, user, shared: idPost });
  },
);

export default postShareController;
