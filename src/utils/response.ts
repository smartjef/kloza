import { Response } from 'express';

interface StandardResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): Response => {
  const response: StandardResponse<T> = {
    success: true,
    data,
  };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  message?: string,
  data?: any,
): Response => {
  const response: StandardResponse<any> = {
    success: false,
    error,
  };
  if (message) response.message = message;
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};
