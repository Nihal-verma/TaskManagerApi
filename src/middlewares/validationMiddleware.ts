import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({ errors: errorDetails });
        return; 
      }
      next(error);
    }
  };
};
