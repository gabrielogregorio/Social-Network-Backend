/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
import express, { NextFunction, Request, Response, Router } from 'express';
import { format } from 'util';
import Multer from 'multer';
import { uuid } from 'uuidv4';
import dotenv from 'dotenv';
import DataUsers from '@/factories/dataUsers';
import DataPosts from '../factories/dataPosts';
import userAuth from '../middlewares/userAuth';
import SavePostsService from '../services/SavePosts';
import PostService from '../services/Post';
import { processId } from '../util/textProcess';
import UserService from '../services/User';
import { bucket } from './bucket';

dotenv.config();

const router: Router = express.Router();

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

router.post(
  '/postLoadFile',
  userAuth,
  multer.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = processId(req.data.id);

    if (!req.file || user === undefined) {
      res.status(400).send('No file uploaded.');
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

router.post('/post', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  let { test, img } = req.body;
  const { body } = req.body;

  // @ts-ignore
  const user = processId(req.data.id);

  if (body === '' || body === undefined || user === undefined || user === '') {
    return res.sendStatus(400);
  }

  if (img === undefined) {
    img = '';
  }
  if (test === undefined) {
    test = false;
  }

  try {
    // @ts-ignore
    const newPostSave = await PostService.Create({ body, user, test, img, edited: false });
    return res.json({ _id: newPostSave._id, user });
  } catch (error) {
    res.statusCode = 500;
    return res.json({ msg: 'Usuário não registrado na base de dados!' });
  }
});

router.get('/posts', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const user = processId(req.data.id);
  if (user === undefined || user === '') {
    return res.sendStatus(400);
  }

  const posts = await PostService.findFollowingPosts(user, true);
  const saves = await SavePostsService.FindByUser(user);

  const idSavedByUser = [];
  saves.forEach((item) => {
    idSavedByUser.push(item.post);
  });

  const postFactories = [];
  posts.forEach(async (post) => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser));
  });

  res.statusCode = 200;
  return res.json(postFactories);
});

router.get('/post/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const user = processId(req.data.id);
  let posts = null;
  try {
    posts = await PostService.FindByIdAndPopulate(req.params.id);
  } catch (error) {
    return res.sendStatus(500);
  }

  if (posts.length === 0) {
    return res.sendStatus(404);
  }

  const saves = await SavePostsService.FindByUser(user);
  const idSavedByUser = [];
  saves.forEach((item) => {
    idSavedByUser.push(item.post);
  });

  const postFactories = [];
  posts.forEach((post) => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser));
  });
  return res.json(postFactories);
});

router.put('/post/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const { body, img } = req.body;
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);

  if (body === '' || body === undefined || id === undefined || user === undefined) {
    return res.sendStatus(400);
  }

  // @ts-ignore
  // eslint-disable-next-line prefer-const
  let upload: any = { body };

  if (img !== '') {
    upload.img = img;
  }

  upload.edited = true;

  try {
    await PostService.FindOneAndUpdate(id, user, upload);

    const post = await PostService.FindOne(id, user);
    if (post === null || post === undefined) {
      return res.sendStatus(403);
    }

    return res.json(post);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.post('/post/save/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);
  try {
    const saveExists = await SavePostsService.FindOne(id, user);

    if (saveExists != null) {
      await SavePostsService.DeleteOne(id, user);
      const userLocal = await UserService.FindByIdRaw(user);
      userLocal.saves = userLocal.saves.filter((value) => value !== `${saveExists._id}`);
      await userLocal.save();

      return res.json({ includeSave: false });
    }
  } catch (error) {
    return res.sendStatus(500);
  }

  try {
    // @ts-ignore
    const newSave = await SavePostsService.Create(id, user);

    const userLocal = await UserService.FindByIdRaw(user);

    userLocal.saves.push(newSave);
    await userLocal.save();

    return res.json({ includeSave: true });
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.get('/post/list/save', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const user = processId(req.data.id);
  const saves = await SavePostsService.FindByUser(user);
  const ids = [];
  saves.forEach((item) => {
    ids.push(item.post);
  });
  const posts = await PostService.FindPostsByIds(user, ids);

  return res.json(posts);
});

// Compartilha um post
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
  await sharedPost.save();

  // @ts-ignore
  return res.json({ _id: newPostSave._id, user, shared: idPost });
});

router.delete('/post/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const id = processId(req.params.id);

  try {
    const resDelete = await PostService.DeleteById(id);
    if (resDelete.deletedCount === 1) {
      return res.sendStatus(200);
    }
    return res.sendStatus(404);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.get('/posts/user/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  const user = processId(req.params.id);
  // @ts-ignore
  const userCall = processId(req.data.id);
  if (user === undefined) {
    return res.sendStatus(400);
  }

  try {
    const userItem = await UserService.FindById(user);
    const ids = DataUsers.Build(userItem).followingIds;
    ids.push(user);
    const posts = await PostService.FindPostsByUser(user);

    const saves = await SavePostsService.FindByUser(user);
    const idSavedByUser = [];
    saves.forEach((item) => {
      idSavedByUser.push(item.post);
    });

    const postFactories = [];
    posts.forEach((post) => {
      postFactories.push(DataPosts.Build(post, userCall, idSavedByUser));
    });

    res.statusCode = 200;
    return res.json(postFactories);
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default router;
