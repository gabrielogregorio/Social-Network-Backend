import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import STATUS_CODE from '@/handlers/index';
import { NextFunction, Response } from 'express';
import { MiddlewareRequest } from '@/interfaces/extends';

dotenv.config();

const userAuth = (req: MiddlewareRequest, res: Response, next: NextFunction) => {
  const authToken = req.headers.authorization;
  if (authToken === '' || authToken === undefined) {
    return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
  }

  const bearer = authToken.split(' ');
  const auth = bearer[1];

  if (auth === undefined) {
    return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
  }

  try {
    const data = jwt.verify(auth, process.env.JWT_SECRET);
    req.data = data;
    if (data.email === undefined) {
      return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
    }
    return next();
  } catch (error) {
    return res.sendStatus(STATUS_CODE.NOT_AUTHORIZED);
  }
};

export default userAuth;
