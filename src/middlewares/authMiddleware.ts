import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

interface JwtUserPayload extends jwt.JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(403);
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next()
  } catch (err) {
    res.sendStatus(403);
  }
};

export type { AuthenticatedRequest, JwtUserPayload };
