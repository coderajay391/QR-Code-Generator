import { NextRequest } from 'next/server';
import { QrService } from '@/src/services/qr.service';
import { getAuthUserFromRequest, successResponse, errorResponse } from '@/lib/apiHelper';
import { UnauthorizedError } from '@/src/utils/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    const { id } = await params;
    const qr = await QrService.getQRCodeById(id, user.userId);
    return successResponse(qr, 'QR code retrieved successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    const { id } = await params;
    const result = await QrService.deleteQRCode(id, user.userId);
    return successResponse(result, 'QR code deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
