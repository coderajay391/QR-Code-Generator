import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      return ApiResponse.success(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
