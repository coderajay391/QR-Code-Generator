import { Request, Response, NextFunction } from 'express';
import { QrService } from '../services/qr.service';
import { StorageService } from '../services/storage.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BadRequestError } from '../utils/errors';

export class QrController {
  /**
   * Anonymous public QR Code generation (Rate-limited, not saved to DB)
   * POST /api/v1/qr/generate
   */
  static async generateAnonymous(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QrService.generate(req.body);
      return ApiResponse.success(res, result, 'QR code generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create and Save QR Code to user history
   * POST /api/v1/qr
   */
  static async createAndSave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required to save QR codes', 401);
      }

      const result = await QrService.createAndSave(userId, req.body);
      return ApiResponse.created(res, result, 'QR code created and saved to history');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List user's saved QR codes with filters and pagination
   * GET /api/v1/qr
   */
  static async getUserQRCodes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      const { page, limit, type, search, sort, startDate, endDate } = req.query as any;

      const result = await QrService.getUserQRCodes(userId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        type,
        search,
        sort,
        startDate,
        endDate,
      });

      return ApiResponse.success(
        res,
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
      next(error);
    }
  }

  /**
   * Get single saved QR code by ID
   * GET /api/v1/qr/:id
   */
  static async getQRCodeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const qr = await QrService.getQRCodeById(id, userId);
      return ApiResponse.success(res, qr, 'QR code retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete saved QR code by ID
   * DELETE /api/v1/qr/:id
   */
  static async deleteQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await QrService.deleteQRCode(id, userId);
      return ApiResponse.success(res, result, 'QR code deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload logo for QR center embedding
   * POST /api/v1/qr/upload-logo
   */
  static async uploadLogo(req: Request, res: Response, next: NextFunction) {
    try {
      // Support base64 image in JSON body OR multipart if handled
      const { image, mimeType, filename } = req.body;
      if (!image) {
        throw new BadRequestError('No image data provided. Provide base64 image data or upload a file.');
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
        throw new BadRequestError('Invalid image format');
      }

      const uploadResult = StorageService.processLogoBuffer(buffer, detectedMime, filename);
      return ApiResponse.created(res, uploadResult, 'Logo processed successfully');
    } catch (error) {
      next(error);
    }
  }
}
