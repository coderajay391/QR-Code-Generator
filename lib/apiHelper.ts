import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../src/utils/errors';
import { JwtUtil } from '../src/utils/jwt';

export function jsonResponse(data: any, statusCode = 200) {
  return NextResponse.json(data, { status: statusCode });
}

export function successResponse(data: any, message = 'Success', statusCode = 200, meta?: any) {
  return jsonResponse(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    statusCode
  );
}

export function errorResponse(error: any) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] | undefined = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof ZodError || error?.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    const issues = (error as any).issues || (error as any).errors || [];
    errors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));
  } else if (error?.code === 11000) {
    statusCode = 409;
    message = 'A resource with that unique key already exists';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return jsonResponse(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    statusCode
  );
}

export function getAuthUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return JwtUtil.verify(token);
  } catch {
    return null;
  }
}
