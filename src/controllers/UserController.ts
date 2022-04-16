import dotenv from 'dotenv';
import express, { NextFunction, Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { format } from 'util';
import { uuid } from 'uuidv4';
import Multer from 'multer';
import CommentService from '@/services/commentService';
import userAuth from '@/middlewares/userAuth';
import { processId, processEmail } from '@/util/textProcess';
import userService from '@/services/userService';
import postService from '@/services/postService';
import saveService from '@/services/savePostsService';
import likeService from '@/services/likeService';
import MessageService from '@/services/messageService';
import ItemBioService from '@/services/itemBioService';
import { ItemBioSchema } from '@/models/ItemBio';
import { bucket } from '@/util/bucket';
import { MiddlewareRequest } from '@/interfaces/extends';
import messages from '@/locales/index';
import STATUS_CODE from '@/handlers/index';

const userController: Router = express.Router();

const jwtSecret = process.env.JWT_SECRET;

dotenv.config();

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

userController.post(
  '/userLoadFile',
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

userController.post(
  '/user',
  body('name').isLength({ min: 2, max: 50 }),
  body('username').isLength({ min: 2, max: 50 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5, max: 50 }),
  async (req: Request, res: Response): Promise<Response> => {
    const { name, email, username, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODE.INVALID_PARAMETERS).json({ errors: errors.array() });
    }

    try {
      const user = await userService.UserExistsByEmail(req.body.email);
      if (user !== undefined) {
        res.statusCode = STATUS_CODE.CONFLICT;
        return res.json({ error: messages.error.email.registered });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const newUser = await userService.Create({ name, email, username, hash, img: '' });

      return jwt.sign(
        { email: newUser.email, name: newUser.name, id: newUser._id },
        jwtSecret,
        { expiresIn: '24h' },
        (error, token) => {
          if (error) {
            return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
          }
          return res.json({ token, email, id: newUser._id });
        },
      );
    } catch (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
  },
);

userController.delete('/user', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const idUser = req.data.id;
  await postService.DeleteAllPostByUser(idUser);
  await userService.DeleteUserById(idUser);
  await saveService.DeleteAllSave(idUser);
  await likeService.DeleteAllLikes(idUser);
  await CommentService.DeleteAllComments(idUser);
  await MessageService.DeleteAllMessages(idUser);
  await ItemBioService.DeleteAllItemBios(idUser);
  return res.sendStatus(STATUS_CODE.SUCCESS);
});

userController.post('/auth', async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const user = await userService.UserExistsByEmail(email);

  if (user === undefined) {
    return res.sendStatus(STATUS_CODE.NOT_FOUND);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
  }

  return jwt.sign({ email, name: user.name, id: user._id }, jwtSecret, { expiresIn: '24h' }, (error, token) => {
    if (error) {
      return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
    }
    return res.json({ token, id: user._id });
  });
});

userController.get('/users', userAuth, async (_req: Request, res: Response): Promise<Response> => {
  const users = await userService.FindAllUsers();
  return res.json(users);
});

userController.get('/user/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  let user;
  try {
    user = await userService.FindById(req.params.id);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }

  if (!user) {
    return res.sendStatus(STATUS_CODE.NOT_FOUND);
  }

  return res.json([user]);
});

userController.put('/user/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const { name, username, email, password, itemBio, bio, motivational } = req.body;
  const { img } = req.body;
  const id: string = processId(req.params.id);
  const user: string = processId(req.data.id);

  if (id !== user) {
    return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
  }

  if (!name || !id || !username || !name) {
    return res.sendStatus(STATUS_CODE.INVALID_PARAMETERS);
  }

  let update: any = {};
  let salt = '';
  let hash = '';

  try {
    if (!password) {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
      update = { name, password: hash, username, motivational, img: img || '', bio };
    } else {
      update = { name, username, motivational, img: img || '', bio };
    }

    if (email) {
      if (!processEmail(email)) {
        return res.status(STATUS_CODE.INVALID_PARAMETERS).json({ error: messages.error.invalid.email });
      }

      const userEmailExists = await userService.UserExistsByEmail(email);
      if (userEmailExists !== undefined) {
        res.statusCode = STATUS_CODE.CONFLICT;

        return res.json({ error: messages.error.email.registered });
      }

      update.email = email;
    }

    if (itemBio) {
      update.itemBio = [];

      const itemsBio = await itemBio?.map(async (bioItem) =>
        ItemBioService.Create(bioItem[0], bioItem[1], id).then((item: ItemBioSchema) => item._id),
      );

      await Promise.all(itemsBio).then((values) => {
        update.itemBio = values;
      });
    }

    await userService.FindByIdAndUpdate(id, update);
    const userNew = await userService.FindById(id);

    if (!userNew) {
      return res.sendStatus(STATUS_CODE.NOT_FOUND);
    }

    return res.json(userNew);
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

userController.post('/user/follow/:id', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const idUserToken = processId(req.data.id);
  const idUserFollow = processId(req.params.id);

  if (idUserToken === idUserFollow) {
    res.statusCode = STATUS_CODE.INVALID_PARAMETERS;
    return res.json({ msg: messages.error.user.cannot.follow.himself });
  }

  try {
    const userFollow = await userService.FindByIdNotPopulate(idUserFollow);
    const user = await userService.FindByIdNotPopulate(idUserToken);

    if (!userFollow || !user) {
      return res.sendStatus(STATUS_CODE.NOT_FOUND);
    }

    const filterFollowingUser = user.following.filter((item) => item._id?.toString() !== idUserFollow?.toString());

    const userNotFollowing = filterFollowingUser.length === user.following.length;
    if (userNotFollowing) {
      user.following.push(userFollow._id);
      userFollow.followers.push(user._id);

      await user.save();
      await userFollow.save();

      return res.json({ followed: true });
    }

    user.following = filterFollowingUser;
    const filterRemoveFollowing = user.followers.filter((item) => item._id !== idUserToken);
    userFollow.followers = filterRemoveFollowing;

    await user.save();
    await userFollow.save();
    return res.json({ followed: false });
  } catch (error) {
    return res.sendStatus(STATUS_CODE.ERROR_IN_SERVER);
  }
});

userController.get('/me', userAuth, async (req: MiddlewareRequest, res: Response): Promise<Response> => {
  const id = processId(req.data.id);

  const user = await userService.FindById(id);

  if (user === undefined) {
    res.statusCode = STATUS_CODE.NOT_FOUND;
    return res.json({ msg: messages.error.user.not.found });
  }

  return res.json([user]);
});

export default userController;
