import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
