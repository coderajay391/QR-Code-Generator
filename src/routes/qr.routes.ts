import { Router } from 'express';
import { QrController } from '../controllers/qr.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.middleware';
import { publicQrRateLimiter, apiRateLimiter } from '../middleware/rateLimit.middleware';
import { generateQrSchema, queryQrHistorySchema } from '../validators/qr.validator';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().min(1, 'Resource ID is required'),
});

const router = Router();

// Public Anonymous Generation
router.post(
  '/generate',
  publicQrRateLimiter,
  validateBody(generateQrSchema),
  QrController.generateAnonymous
);

// Upload Logo
router.post(
  '/upload-logo',
  apiRateLimiter,
  QrController.uploadLogo
);

// Authenticated History & Management
router.post(
  '/',
  authMiddleware,
  apiRateLimiter,
  validateBody(generateQrSchema),
  QrController.createAndSave
);

router.get(
  '/',
  authMiddleware,
  apiRateLimiter,
  validateQuery(queryQrHistorySchema),
  QrController.getUserQRCodes
);

router.get(
  '/:id',
  authMiddleware,
  apiRateLimiter,
  validateParams(idParamSchema),
  QrController.getQRCodeById
);

router.delete(
  '/:id',
  authMiddleware,
  apiRateLimiter,
  validateParams(idParamSchema),
  QrController.deleteQRCode
);

export default router;
