import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$|^transparent$/i;

export const qrOptionsSchema = z.object({
  size: z
    .number()
    .int()
    .min(100, 'Size must be at least 100px')
    .max(2000, 'Size cannot exceed 2000px')
    .optional()
    .default(300),
  margin: z
    .number()
    .int()
    .min(0, 'Margin cannot be negative')
    .max(20, 'Margin cannot exceed 20')
    .optional()
    .default(4),
  errorCorrectionLevel: z
    .enum(['L', 'M', 'Q', 'H', 'low', 'medium', 'quartile', 'high'])
    .optional()
    .default('M'),
  foregroundColor: z
    .string()
    .regex(hexColorRegex, 'Invalid foreground color format (expected hex e.g. #000000 or transparent)')
    .optional()
    .default('#000000'),
  backgroundColor: z
    .string()
    .regex(hexColorRegex, 'Invalid background color format (expected hex e.g. #FFFFFF or transparent)')
    .optional()
    .default('#FFFFFF'),
  format: z
    .enum(['png', 'svg', 'dataurl'])
    .optional()
    .default('png'),
  logoUrl: z
    .string()
    .url('Logo URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  style: z
    .enum(['square', 'dots', 'rounded'])
    .optional()
    .default('square'),
});

export const wifiSchema = z.object({
  ssid: z.string().min(1, 'SSID is required').max(64),
  password: z.string().max(128).optional(),
  encryption: z.enum(['WPA', 'WPA2', 'WEP', 'Open', 'nopass', 'wpa', 'wep', 'open']).optional().default('WPA'),
  hidden: z.boolean().optional().default(false),
});

export const vcardSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  street: z.string().max(150).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(50).optional(),
  note: z.string().max(300).optional(),
});

export const emailQrSchema = z.object({
  email: z.string().email('Invalid email address'),
  subject: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

export const phoneQrSchema = z.object({
  phone: z.string().min(3, 'Phone number too short').max(30, 'Phone number too long'),
});

export const smsQrSchema = z.object({
  phone: z.string().min(3, 'Phone number too short').max(30, 'Phone number too long'),
  message: z.string().max(1000).optional(),
});

export const geoQrSchema = z.object({
  latitude: z.union([z.number().min(-90).max(90), z.string()]),
  longitude: z.union([z.number().min(-180).max(180), z.string()]),
});

export const cryptoQrSchema = z.object({
  address: z.string().min(10, 'Crypto address is too short'),
  currency: z.string().max(20).optional().default('bitcoin'),
  amount: z.union([z.number().positive(), z.string()]).optional(),
  message: z.string().max(200).optional(),
});

export const generateQrSchema = z.object({
  type: z
    .enum(['text', 'url', 'wifi', 'vcard', 'contact', 'email', 'phone', 'sms', 'geo', 'crypto'])
    .optional()
    .default('text'),
  data: z.any().optional(),
  title: z.string().max(100).optional(),
  options: qrOptionsSchema.optional().default({
    size: 300,
    margin: 4,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    format: 'png',
    style: 'square',
  }),
  // typed fields allowed directly in root:
  ssid: z.string().optional(),
  password: z.string().optional(),
  encryption: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  message: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  address: z.string().optional(),
  amount: z.union([z.number(), z.string()]).optional(),
});

export const queryQrHistorySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'title:asc', 'title:desc']).optional().default('createdAt:desc'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type GenerateQrInput = z.infer<typeof generateQrSchema>;
export type QrOptionsInput = z.infer<typeof qrOptionsSchema>;
export type QueryQrHistoryInput = z.infer<typeof queryQrHistorySchema>;
