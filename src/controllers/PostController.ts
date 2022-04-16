import express, { NextFunction, Request, Response, Router } from 'express';
import { format } from 'util';
import Multer from 'multer';
import { uuid } from 'uuidv4';
import dotenv from 'dotenv';
import DataUsers from '@/factories/dataUsers';
import DataPosts, { dataPostsType } from '@/factories/dataPosts';
import userAuth from '@/middlewares/userAuth';
import SavePostsService from '@/services/savePostsService';
import { ISave } from '@/models/Save';
import PostService from '@/services/postService';
import { processId } from '@/util/textProcess';
import UserService from '@/services/userService';
import { bucket } from '@/util/bucket';
import { IPost } from '@/models/Post';
import { MiddlewareRequest } from '@/interfaces/extends';
import messages from '@/locales/index';
import STATUS_CODE from '@/handlers/index';

dotenv.config();

const postController: Router = express.Router();

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

postController.post(
  '/postLoadFile',
  userAuth,
  multer.single('image'),
  async (req: MiddlewareRequest, res: Response, next: NextFunction) => {
    const user = processId(req.data.id);

    if (!req.file || user === undefined) {
      res.status(STATUS_CODE.INVALID_PARAMETERS).send(messages.error.no.file.uploaded);
      return;
    }

    const blob = bucket.file(`${Date.now().toString()}-${uuid()}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', () => {
      const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
      res.json({ file: publicUrl });
    });
    blobStream.end(req.file.buffer);
  },
);

postController.post('/post', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  let { img } = req.body;
  const { test, body } = req.body;
  const user = processId(req.data.id);

  const postNotCompleted = !body || !user;

  if (postNotCompleted) {
    return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
  }

  if (!img) {
    img = '';
  }

  try {
    const newPostSave = await PostService.Create({ body, user, test: !!test, img, sharePost: null });
    return res.json({ _id: newPostSave._id, user });
  } catch (error) {
    res.statusCode = STATUS_CODE.ERROR_IN_SERVER;
    return res.json({ msg: messages.error.user.not.found });
  }
});

postController.get('/posts', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const user = processId(req.data.id);
  if (!user) {
    return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
  }

  const posts = await PostService.findFollowingPosts(user, true);
  const saves: ISave[] = await SavePostsService.FindByUser(user);

  const idSavedByUser = [];
  saves.forEach((item) => {
    idSavedByUser.push(item.post);
  });

  const postFactories: dataPostsType[] = [];
  posts.forEach(async (post) => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser));
  });

  res.statusCode = STATUS_CODE.SUCCESS;
  return res.json(postFactories);
});

postController.get('/post/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const user = processId(req.data.id);
  let posts = null;

  try {
    posts = await PostService.FindByIdAndPopulate(req.params.id);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }

  if (posts.length === 0) {
    return res.sendStatus(STATUS_CODE.NOT_FOUND);
  }

  const saves: ISave[] = await SavePostsService.FindByUser(user);
  const idSavedByUser = [];
  saves.forEach((item) => {
    idSavedByUser.push(item.post);
  });

  const postFactories: dataPostsType[] = [];
  posts.forEach((post) => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser));
  });

  return res.json(postFactories);
});

postController.put('/post/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const { body, img } = req.body;
  const id = processId(req.params.id);
  const user = processId(req.data.id);

  if (!body || !id || !user) {
    return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
  }

  const update: any = { body, img, edited: true };

  try {
    await PostService.FindOneAndUpdate(id, user, update);

    const post: IPost = await PostService.FindOne(id, user);

    if (!post) {
      return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
    }

    return res.json(post);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

postController.post('/post/save/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  const user = processId(req.data.id);

  try {
    const saveExists: ISave = await SavePostsService.FindOne(id, user);

    if (saveExists) {
      await SavePostsService.DeleteOne(id, user);
      const userLocal = await UserService.FindByIdRaw(user);
      userLocal.saves = userLocal.saves.filter((value) => value !== `${saveExists._id}`);
      await userLocal.save();

      return res.json({ includeSave: false });
    }
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }

  try {
    const newSave: ISave = await SavePostsService.Create(id, user);
    const userLocal = await UserService.FindByIdRaw(user);

    userLocal.saves.push(newSave);
    await userLocal.save();

    return res.json({ includeSave: true });
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

postController.get('/post/list/save', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const user = processId(req.data.id);
  const saves: ISave[] = await SavePostsService.FindByUser(user);
  const ids = [];

  saves.forEach((item) => {
    ids.push(item.post);
  });

  const posts = await PostService.FindPostsByIds(user, ids);
  return res.json(posts);
});

postController.post('/post/share/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const user = processId(req.data.id);
  const idPost = processId(req.params.id);

  const newPostSave: IPost = await PostService.Create({ user, sharePost: idPost, body: '', test: false, img: '' });
  const sharedPost: IPost = await PostService.FindById(idPost);

  sharedPost.thisReferencesShared.push(newPostSave);
  await sharedPost.save();

  return res.json({ _id: newPostSave._id, user, shared: idPost });
});

postController.delete('/post/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);

  try {
    const resDelete = await PostService.DeleteById(id);
    if (resDelete.rowsAffected === 1) {
      return res.sendStatus(STATUS_CODE.SUCCESS);
    }
    return res.sendStatus(STATUS_CODE.NOT_FOUND);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

postController.get('/posts/user/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const user = processId(req.params.id);
  const userCall = processId(req.data.id);

  if (user === undefined) {
    return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
  }

  try {
    const userItem = await UserService.FindById(user);
    const ids: string[] = DataUsers.Build(userItem).followingIds;
    ids.push(user);
    const posts = await PostService.FindPostsByUser(user);

    const saves: ISave[] = await SavePostsService.FindByUser(user);
    const idSavedByUser = [];
    saves.forEach((item) => {
      idSavedByUser.push(item.post);
    });

    const postFactories: dataPostsType[] = [];
    posts.forEach((post) => {
      postFactories.push(DataPosts.Build(post, userCall, idSavedByUser));
    });

    res.statusCode = STATUS_CODE.SUCCESS;
    return res.json(postFactories);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

export default postController;
