import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import AppError from '../utils/AppError';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError & { path?: string }) => {
      return `${error.path}: ${error.msg}`;
    });
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
}; 