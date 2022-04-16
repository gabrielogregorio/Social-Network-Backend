/* eslint-disable no-underscore-dangle */
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
import { bucket } from '../util/bucket';
import logger from '../logger';

const userController: Router = express.Router();

const jwtSecret = process.env.JWT_SECRET;

dotenv.config();

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

userController.post(
  '/userLoadFile',
  userAuth,
  multer.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Load image user');
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

userController.post(
  '/user',
  body('name').isLength({ min: 2, max: 50 }),
  body('username').isLength({ min: 2, max: 50 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5, max: 50 }),
  async (req: Request, res: Response): Promise<Response> => {
    logger.info(`try create user ${req.body.email}`);
    const { name, email, username, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await userService.UserExistsByEmail(req.body.email);
      if (user !== undefined) {
        res.statusCode = 409;
        return res.json({ error: 'E-mail já cadastrado!' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // @ts-ignore
      const newUser = await userService.Create({ name, email, username, hash });

      return jwt.sign(
        { email: newUser.email, name: newUser.name, id: newUser._id },
        jwtSecret,
        { expiresIn: '24h' },
        (error, token) => {
          if (error) {
            return res.sendStatus(500);
          }
          return res.json({ token, email, id: newUser._id });
        },
      );
    } catch (error) {
      return res.sendStatus(500);
    }
  },
);

userController.delete('/user', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const idUser = req.data.id;
  await postService.DeleteAllPostByUser(idUser);
  await userService.DeleteUserById(idUser);
  await saveService.DeleteAllSave(idUser);
  await likeService.DeleteAllLikes(idUser);
  await CommentService.DeleteAllComments(idUser);
  await MessageService.DeleteAllMessages(idUser);
  await ItemBioService.DeleteAllItemBios(idUser);
  return res.sendStatus(200);
});

userController.post('/auth', async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const user = await userService.FindUserByEmail(email);

  if (user === undefined) {
    return res.sendStatus(404);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.sendStatus(403);
  }

  return jwt.sign({ email, name: user.name, id: user._id }, jwtSecret, { expiresIn: '24h' }, (error, token) => {
    if (error) {
      return res.sendStatus(500);
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
    return res.sendStatus(500);
  }

  if (!user) {
    return res.sendStatus(404);
  }

  return res.json([user]);
});

userController.put('/user/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const { name, username, email, password, itemBio, bio, motivational } = req.body;
  let { img } = req.body;
  const id = processId(req.params.id);
  // @ts-ignore
  const user = processId(req.data.id);
  let updatePassword;

  if (id !== `${user}`) {
    // Só pode alterar a si mesmo
    return res.sendStatus(403);
  }
  if (name === '' || id === '' || username === '' || name === undefined || id === undefined || username === undefined) {
    return res.sendStatus(400);
  }

  if (password === '' || password === undefined) {
    updatePassword = false;
  } else {
    updatePassword = true;
  }

  if (img === undefined) {
    // @ts-ignore
    img = '';
  }

  let update = {};
  let salt = '';
  let hash = '';
  try {
    if (updatePassword) {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
      update = { name, password: hash, username };
    } else {
      update = { name, username };
    }

    const hasImage = img !== '';
    if (hasImage) {
      // @ts-ignore
      update.img = img;
    }

    const hasMotivational = motivational !== '' && motivational !== undefined;
    if (hasMotivational) {
      // @ts-ignore
      update.motivational = motivational;
    }

    const hasBio = bio !== '' && bio !== undefined;
    if (hasBio) {
      // @ts-ignore
      update.bio = bio;
    }

    // Tem nova email
    if (email !== '' && email !== undefined) {
      if (!processEmail(email)) {
        return res.status(400).json({ error: 'E-mail é inválido' });
      }
      const userEmailExists = await userService.UserExistsByEmail(email);
      if (userEmailExists !== undefined) {
        res.statusCode = 409;
        return res.json({ error: 'E-mail já cadastrado!' });
      }
      // @ts-ignore
      update.email = email;
    }

    if (itemBio) {
      // @ts-ignore
      update.itemBio = [];

      // Loop para adicionar os novos itens
      for (let i = 0; i < itemBio.length; i += 1) {
        // Relaciona os itens com o usuário

        // eslint-disable-next-line no-await-in-loop
        const item: ItemBioSchema = await ItemBioService.Create(itemBio[i][0], itemBio[i][1], id);
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        await update.itemBio.push(item._id);
      }
    }

    // Atualiza o perfil do usuário
    await userService.FindByIdAndUpdate(id, update);

    // retorna os dados atualizados!
    const userNew = await userService.FindById(id);

    if (userNew === null || userNew === undefined) {
      return res.sendStatus(404);
    }
    return res.json(userNew);
  } catch (error) {
    return res.sendStatus(500);
  }
});

userController.post('/user/follow/:id', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const idUserToken = processId(req.data.id);
  const idUserFollow = processId(req.params.id);

  if (idUserToken === idUserFollow) {
    res.statusCode = 400;
    return res.json({ msg: 'Usuário não pode seguir a si mesmo!' });
  }

  try {
    // Encontra o usuário que quer seguir e o usuário que será seguido
    const userFollow = await userService.FindByIdNotPopulate(idUserFollow);
    const user = await userService.FindByIdNotPopulate(idUserToken);

    // Algum usuário não encontrado
    if (userFollow === '' || user === '' || userFollow === null || user === null) {
      return res.sendStatus(404);
    }

    // Verifica se o usuário que quer seguir já está seguindo o outro usuário
    const filterFollonUser = user.following.filter((item) => item._id?.toString() !== idUserFollow?.toString());

    // Usuário NÃO estava seguindo
    if (filterFollonUser.length === user.following.length) {
      // Atualizar ambos os lados
      user.following.push(userFollow._id);
      userFollow.followers.push(user._id);

      await user.save();
      await userFollow.save();

      return res.json({ followed: true });

      // unfolow
    }

    // Atualizar ambos os lados
    user.following = filterFollonUser;
    const filterRemoveFollon = user.followers.filter((item) => item._id != idUserToken);
    userFollow.followers = filterRemoveFollon;

    await user.save();
    await userFollow.save();
    return res.json({ followed: false });
  } catch (error) {
    return res.sendStatus(500);
  }
});

userController.get('/me', userAuth, async (req: Request, res: Response): Promise<Response> => {
  // @ts-ignore
  const id = processId(req.data.id);

  const user = await userService.FindById(id);

  if (user === undefined) {
    res.statusCode = 404;
    return res.json({ msg: 'Identificador do usuário não encontrado' });
  }

  return res.json([user]);
});

export default userController;
