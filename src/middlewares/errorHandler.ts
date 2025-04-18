import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message
    }));
    res.status(400).json({ errors: formattedErrors });
  } else {
    console.error(err.stack);
    res.status(500).send({ error: err.message || 'Something went wrong!' });
  }
};