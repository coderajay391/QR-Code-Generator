import mongoose from 'mongoose';
import { UserModel, IUser } from './User';
import { QRCodeModel, IQRCode } from './QRCode';
import { dbState } from '../config/database';
import bcrypt from 'bcryptjs';

// In-memory fallback stores
const memoryUsers: Map<string, any> = new Map();
const memoryQRCodes: Map<string, any> = new Map();

function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

export class DbAdapter {
  // User Operations
  static async createUser(userData: { name: string; email: string; password: string; role?: string }): Promise<any> {
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      const user = new UserModel(userData);
      await user.save();
      return user.toJSON();
    }

    // In-memory fallback
    const normalizedEmail = userData.email.toLowerCase().trim();
    for (const u of memoryUsers.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        const err: any = new Error('User with this email already exists');
        err.code = 11000;
        throw err;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const id = generateId();
    const now = new Date();

    const userObj = {
      _id: id,
      id,
      name: userData.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    memoryUsers.set(id, userObj);

    const safeUser = { ...userObj };
    delete (safeUser as any).password;
    return safeUser;
  }

  static async findUserByEmail(email: string, includePassword = false): Promise<any | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      let query = UserModel.findOne({ email: normalizedEmail });
      if (includePassword) {
        query = query.select('+password');
      }
      const user = await query.exec();
      if (!user) return null;
      return user;
    }

    // In-memory fallback
    for (const u of memoryUsers.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        return {
          ...u,
          async comparePassword(candidate: string) {
            return bcrypt.compare(candidate, u.password);
          },
        };
      }
    }
    return null;
  }

  static async findUserById(id: string): Promise<any | null> {
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      return UserModel.findById(id).exec();
    }
    const user = memoryUsers.get(id);
    if (!user) return null;
    const safe = { ...user };
    delete safe.password;
    return safe;
  }

  // QR Code Operations
  static async createQRCode(qrData: Partial<IQRCode>): Promise<any> {
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      const qr = new QRCodeModel(qrData);
      await qr.save();
      return qr.toJSON();
    }

    const id = generateId();
    const now = new Date();
    const doc = {
      _id: id,
      id,
      userId: qrData.userId?.toString() || null,
      title: qrData.title || 'Untitled QR Code',
      type: qrData.type || 'text',
      data: qrData.data,
      formattedContent: qrData.formattedContent,
      options: qrData.options,
      imageUrl: qrData.imageUrl,
      format: qrData.format || 'png',
      tags: qrData.tags || [],
      scanCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    memoryQRCodes.set(id, doc);
    return doc;
  }

  static async findQRCodeById(id: string): Promise<any | null> {
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      return QRCodeModel.findById(id).exec();
    }
    return memoryQRCodes.get(id) || null;
  }

  static async findUserQRCodes(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
      sort?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      const query: any = { userId };

      if (filters.type) {
        query.type = filters.type.toLowerCase();
      }

      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
          { title: searchRegex },
          { formattedContent: searchRegex },
        ];
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      let sortOptions: any = { createdAt: -1 };
      if (filters.sort === 'createdAt:asc') sortOptions = { createdAt: 1 };
      else if (filters.sort === 'title:asc') sortOptions = { title: 1 };
      else if (filters.sort === 'title:desc') sortOptions = { title: -1 };

      const [items, total] = await Promise.all([
        QRCodeModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
        QRCodeModel.countDocuments(query).exec(),
      ]);

      return {
        items: items.map((i) => (typeof i.toJSON === 'function' ? i.toJSON() : i)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    // In-memory fallback
    let all = Array.from(memoryQRCodes.values()).filter(
      (item) => item.userId?.toString() === userId.toString()
    );

    if (filters.type) {
      all = all.filter((item) => item.type?.toLowerCase() === filters.type?.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.formattedContent?.toLowerCase().includes(q)
      );
    }

    if (filters.startDate) {
      const s = new Date(filters.startDate).getTime();
      all = all.filter((item) => new Date(item.createdAt).getTime() >= s);
    }

    if (filters.endDate) {
      const e = new Date(filters.endDate).getTime();
      all = all.filter((item) => new Date(item.createdAt).getTime() <= e);
    }

    // Sort
    if (filters.sort === 'createdAt:asc') {
      all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters.sort === 'title:asc') {
      all.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (filters.sort === 'title:desc') {
      all.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else {
      // Default createdAt:desc
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = all.length;
    const paginated = all.slice(skip, skip + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async deleteQRCode(id: string, userId: string): Promise<boolean> {
    if (dbState.mode === 'mongodb' && mongoose.connection.readyState === 1) {
      const result = await QRCodeModel.findOneAndDelete({ _id: id, userId }).exec();
      return !!result;
    }

    const item = memoryQRCodes.get(id);
    if (item && item.userId?.toString() === userId.toString()) {
      memoryQRCodes.delete(id);
      return true;
    }
    return false;
  }
}
