import { NextRequest } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { loginSchema } from '@/src/validators/auth.validator';
import { successResponse, errorResponse } from '@/lib/apiHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = await loginSchema.parseAsync(body);
    const result = await AuthService.login(validated);
    return successResponse(result, 'Login successful', 200);
  } catch (error) {
    return errorResponse(error);
  }
}
