import dotenv from 'dotenv';
import express, { Request, Response, Router } from 'express';
import { MiddlewareRequest } from 'src/interfaces/extends';
import userAuth from '@/middlewares/userAuth';
import PostService from '@/services/postService';
import CommentService from '@/services/commentService';
import { processId } from '@/util/textProcess';
import STATUS_CODE from '@/handlers/index';

dotenv.config();

const postCommentController: Router = express.Router();

postCommentController.get('/post/comments/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id: string = processId(req.params.id);
  const comments = await CommentService.FindByPosts(id);
  return res.json(comments);
});

postCommentController.post(
  '/post/comment/:id',
  userAuth,
  async (req: MiddlewareRequest, res: Response): Promise<Response> => {
    const id: string = processId(req.params.id);
    const user: string = processId(req.data.id);
    const { replie } = req.body;
    const { text } = req.body;

    if (!text || !id || !user) {
      return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
    }

    try {
      if (replie !== undefined) {
        const newCommentReplies = await CommentService.Create({ post: id, user, text, replie });

        const originalComment = await CommentService.FindById(replie);
        originalComment.replies.push(newCommentReplies);
        await originalComment.save();

        return res.json({ id: newCommentReplies.id, replie: originalComment._id });
      }

      const newComment = await CommentService.Create({ post: id, user, text, base: true, replie: null });

      const post = await PostService.FindById(id);
      post.comments.push(newComment);
      await post.save();

      return res.json({ id: newComment.id });
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
  },
);

postCommentController.delete(
  '/post/comment/:idComment',
  userAuth,
  async (req: MiddlewareRequest, res: Response): Promise<Response> => {
    const id: string = processId(req.params.idComment);
    const user: string = processId(req.data.id);

    if (!id || !user) {
      return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
    }

    try {
      await CommentService.DeleteOne(id, user);
      return res.sendStatus(STATUS_CODE.SUCCESS);
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
  },
);

postCommentController.put(
  '/post/comment/:idComment',
  userAuth,
  async (req: MiddlewareRequest, res: Response): Promise<Response> => {
    const id: string = processId(req.params.idComment);
    const user: string = processId(req.data.id);
    const { text } = req.body;

    if (!text || !id || !user) {
      return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
    }

    try {
      const comment = await CommentService.FindOneAndUpdate(id, user, { text });

      if (!comment) {
        return res.sendStatus(STATUS_CODE.NOT_FOUND);
      }

      return res.sendStatus(STATUS_CODE.SUCCESS);
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
  },
);

export default postCommentController;
