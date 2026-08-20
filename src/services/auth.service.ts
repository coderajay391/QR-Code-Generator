import { DbAdapter } from '../models/dbAdapter';
import { JwtUtil } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { logger } from '../config/logger';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await DbAdapter.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email address is already registered');
    }

    const user = await DbAdapter.createUser({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    const token = JwtUtil.sign({
      userId: user.id || user._id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async login(input: LoginInput) {
    const user = await DbAdapter.findUserByEmail(input.email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = JwtUtil.sign({
      userId: user.id || user._id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await DbAdapter.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
