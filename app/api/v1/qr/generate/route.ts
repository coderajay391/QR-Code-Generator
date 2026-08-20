import { NextRequest } from 'next/server';
import { QrService } from '@/src/services/qr.service';
import { generateQrSchema } from '@/src/validators/qr.validator';
import { successResponse, errorResponse } from '@/lib/apiHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = await generateQrSchema.parseAsync(body);
    const result = await QrService.generate(validated);
    return successResponse(result, 'QR code generated successfully', 200);
  } catch (error) {
    return errorResponse(error);
  }
}
