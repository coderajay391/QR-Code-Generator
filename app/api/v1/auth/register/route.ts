import { NextRequest } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { registerSchema } from '@/src/validators/auth.validator';
import { successResponse, errorResponse } from '@/lib/apiHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = await registerSchema.parseAsync(body);
    const result = await AuthService.register(validated);
    return successResponse(result, 'User registered successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
