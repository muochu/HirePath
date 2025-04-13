class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

// Helper function to create common error types
export const createError = {
  badRequest: (message: string) => new AppError(message, 400),
  unauthorized: (message: string) => new AppError(message, 401),
  forbidden: (message: string) => new AppError(message, 403),
  notFound: (message: string) => new AppError(message, 404),
  conflict: (message: string) => new AppError(message, 409),
  validation: (message: string) => new AppError(message, 422),
  internal: (message: string) => new AppError(message, 500)
}; 