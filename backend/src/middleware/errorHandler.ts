import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle operational errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
    };
    
    // Include additional error data if available (e.g., eligibility data)
    if ((err as any).errorType) {
      response.errorType = (err as any).errorType;
    }
    if ((err as any).eligibilityData) {
      response.eligibilityData = (err as any).eligibilityData;
    }
    
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors (body-parser)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body. Please check your JSON syntax.',
      hint: 'Make sure all property names are in double quotes and there are no trailing commas.',
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    console.error('❌ Prisma Error:', {
      code: prismaError.code,
      meta: prismaError.meta,
      message: prismaError.message,
    });
    
    // Provide more specific error messages based on Prisma error codes
    let message = 'Database operation failed';
    
    switch (prismaError.code) {
      case 'P2002':
        message = `Duplicate entry: ${prismaError.meta?.target?.join(', ') || 'unique constraint violated'}`;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      case 'P2025':
        message = 'Record not found';
        break;
      default:
        message = process.env.NODE_ENV === 'development' 
          ? `Database error: ${prismaError.message}` 
          : 'Database operation failed';
    }
    
    res.status(400).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        details: {
          code: prismaError.code,
          meta: prismaError.meta,
        }
      }),
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('❌ Unexpected Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Send generic error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};
