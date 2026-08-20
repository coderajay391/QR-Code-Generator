import { NextRequest } from 'next/server';
import { QrService } from '@/src/services/qr.service';
import { generateQrSchema, queryQrHistorySchema } from '@/src/validators/qr.validator';
import { getAuthUserFromRequest, successResponse, errorResponse } from '@/lib/apiHelper';
import { UnauthorizedError } from '@/src/utils/errors';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user?.userId) {
      throw new UnauthorizedError('Authentication required to save QR codes to history');
    }

    const body = await req.json();
    const validated = await generateQrSchema.parseAsync(body);
    const result = await QrService.createAndSave(user.userId, validated);
    return successResponse(result, 'QR code created and saved to history', 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUserFromRequest(req);
    if (!user?.userId) {
      throw new UnauthorizedError('Authentication required to view QR code history');
    }

    const searchParams = req.nextUrl.searchParams;
    const query = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const validatedQuery = await queryQrHistorySchema.parseAsync(query);
    const result = await QrService.getUserQRCodes(user.userId, validatedQuery);

    return successResponse(
      {
        items: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
      'QR codes retrieved successfully',
      200,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
