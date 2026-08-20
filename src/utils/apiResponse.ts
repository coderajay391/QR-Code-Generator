import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any[];
  timestamp?: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Operation successful',
    statusCode = 200,
    meta?: any
  ): Response {
    const payload: ApiResponseData<T> = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = 500,
    errors?: any[]
  ): Response {
    const payload: ApiResponseData = {
      success: false,
      message,
    };
    if (errors && errors.length > 0) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}
