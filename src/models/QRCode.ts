import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQROptions {
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  format: 'png' | 'svg' | 'dataurl';
  logoUrl?: string;
  style?: 'square' | 'dots' | 'rounded';
}

export interface IQRCode extends Document {
  userId?: mongoose.Types.ObjectId | string;
  title?: string;
  type: string;
  data: any;
  formattedContent: string;
  options: IQROptions;
  imageUrl: string;
  format: string;
  tags?: string[];
  scanCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>(
  {
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      index: true,
      required: false,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'Untitled QR Code',
    },
    type: {
      type: String,
      required: [true, 'QR Code type is required'],
      enum: ['text', 'url', 'wifi', 'vcard', 'contact', 'email', 'phone', 'sms', 'geo', 'crypto'],
      default: 'text',
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, 'QR Code raw data is required'],
    },
    formattedContent: {
      type: String,
      required: [true, 'Formatted QR content is required'],
    },
    options: {
      size: { type: Number, default: 300 },
      margin: { type: Number, default: 4 },
      errorCorrectionLevel: { type: String, enum: ['L', 'M', 'Q', 'H'], default: 'M' },
      foregroundColor: { type: String, default: '#000000' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      format: { type: String, enum: ['png', 'svg', 'dataurl'], default: 'png' },
      logoUrl: { type: String, default: '' },
      style: { type: String, default: 'square' },
    },
    imageUrl: {
      type: String,
      required: [true, 'QR Code image representation is required'],
    },
    format: {
      type: String,
      default: 'png',
    },
    tags: [{ type: String, trim: true }],
    scanCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

QRCodeSchema.index({ userId: 1, createdAt: -1 });
QRCodeSchema.index({ userId: 1, type: 1 });
QRCodeSchema.index({ userId: 1, title: 'text', formattedContent: 'text' });

export const QRCodeModel: Model<IQRCode> =
  mongoose.models.QRCode || mongoose.model<IQRCode>('QRCode', QRCodeSchema);
