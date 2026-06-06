import {ErrorRequestHandler, Request, Response, NextFunction} from 'express';
import { AppError } from '@/utils/appError';
import { ZodError } from 'zod';

export const errorHandling: ErrorRequestHandler = (
  error,
  request: Request, 
  response: Response, 
  next: NextFunction) => 
  {
  
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({ 
        status: "error",
        message: error.message 
      });
    }

    if (error instanceof ZodError) {
      return response.status(400).json({ 
        message: "Validation error",
         issues: error.format() 
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  }