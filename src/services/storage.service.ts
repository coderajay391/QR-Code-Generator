import crypto from 'crypto';
import { env } from '../config/env';
import { BadRequestError } from '../utils/errors';

export interface UploadedFileResult {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];

export class StorageService {
  /**
   * Validates and processes uploaded logo image
   */
  static processLogoBuffer(
    buffer: Buffer,
    originalMimeType: string,
    originalFilename = 'logo.png'
  ): UploadedFileResult {
    const size = buffer.length;

    if (size > env.MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File size exceeds limit of ${(env.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`
      );
    }

    const mimeType = originalMimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestError(
        `Invalid file type (${mimeType}). Allowed formats: PNG, JPEG, WebP, SVG.`
      );
    }

    // Determine extension safely
    let ext = 'png';
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = 'jpg';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/svg+xml') ext = 'svg';

    // Generate non-colliding cryptographically safe filename
    const safeHash = crypto.randomBytes(16).toString('hex');
    const safeFilename = `qr-logo-${Date.now()}-${safeHash}.${ext}`;

    // Base64 data URL
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return {
      filename: safeFilename,
      url: dataUrl,
      mimeType,
      size,
    };
  }
}
