import { NextRequest } from 'next/server';
import { AuthService } from '@/src/services/auth.service';
import { getAuthUserFromRequest, successResponse, errorResponse } from '@/lib/apiHelper';
import { UnauthorizedError } from '@/src/utils/errors';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getAuthUserFromRequest(req);
    if (!userPayload?.userId) {
      throw new UnauthorizedError('Unauthorized. Bearer token missing or invalid.');
    }
    const user = await AuthService.getCurrentUser(userPayload.userId);
    return successResponse({ user }, 'User profile retrieved successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
