import { NextRequest } from 'next/server';
import { StorageService } from '@/src/services/storage.service';
import { BadRequestError } from '@/src/utils/errors';
import { successResponse, errorResponse } from '@/lib/apiHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType, filename } = body;

    if (!image) {
      throw new BadRequestError('No image data provided');
    }

    let buffer: Buffer;
    let detectedMime = mimeType || 'image/png';

    if (typeof image === 'string' && image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        detectedMime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }
    } else if (typeof image === 'string') {
      buffer = Buffer.from(image, 'base64');
    } else {
      throw new BadRequestError('Invalid image data format');
    }

    const result = StorageService.processLogoBuffer(buffer, detectedMime, filename);
    return successResponse(result, 'Logo processed successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
