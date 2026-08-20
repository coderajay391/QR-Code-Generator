import QRCode from 'qrcode';
import { QrFormatter } from '../utils/qrFormatter';
import { DbAdapter } from '../models/dbAdapter';
import { GenerateQrInput, QrOptionsInput } from '../validators/qr.validator';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';

export interface GeneratedQrResult {
  format: 'png' | 'svg' | 'dataurl';
  qrCode: string; // Base64 data URL or SVG XML string
  type: string;
  formattedContent: string;
  options: QrOptionsInput;
}

export class QrService {
  /**
   * Generates QR Code string/dataURL based on data payload & options
   */
  static async generate(payload: GenerateQrInput): Promise<GeneratedQrResult> {
    const type = (payload.type || 'text').toLowerCase();
    
    // Extract data
    let rawData = payload.data;
    if (!rawData) {
      if (type === 'wifi') {
        rawData = {
          ssid: payload.ssid,
          password: payload.password,
          encryption: payload.encryption || 'WPA',
        };
      } else if (type === 'vcard' || type === 'contact') {
        rawData = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          email: payload.email,
          company: payload.company,
          website: payload.website,
        };
      } else if (type === 'email') {
        rawData = {
          email: payload.email || '',
          subject: payload.subject,
          body: payload.body,
        };
      } else if (type === 'phone') {
        rawData = { phone: payload.phone || '' };
      } else if (type === 'sms') {
        rawData = { phone: payload.phone || '', message: payload.message };
      } else if (type === 'geo') {
        rawData = { latitude: payload.latitude, longitude: payload.longitude };
      } else if (type === 'crypto') {
        rawData = { address: payload.address, amount: payload.amount };
      } else {
        rawData = '';
      }
    }

    const formattedContent = QrFormatter.formatPayload(type, rawData);

    if (!formattedContent || formattedContent.trim() === '') {
      throw new BadRequestError('QR Code content or required fields cannot be empty');
    }

    const opts: QrOptionsInput = {
      size: payload.options?.size || 300,
      margin: payload.options?.margin ?? 4,
      errorCorrectionLevel: (payload.options?.errorCorrectionLevel || 'M') as any,
      foregroundColor: payload.options?.foregroundColor || '#000000',
      backgroundColor: payload.options?.backgroundColor || '#FFFFFF',
      format: payload.options?.format || 'png',
      logoUrl: payload.options?.logoUrl,
      style: payload.options?.style || 'square',
    };

    // Map error correction levels to QRCode library values
    let ecl: 'L' | 'M' | 'Q' | 'H' = 'M';
    const eclInput = (opts.errorCorrectionLevel || 'M').toString().toUpperCase();
    if (['L', 'LOW'].includes(eclInput)) ecl = 'L';
    else if (['M', 'MEDIUM'].includes(eclInput)) ecl = 'M';
    else if (['Q', 'QUARTILE'].includes(eclInput)) ecl = 'Q';
    else if (['H', 'HIGH'].includes(eclInput)) ecl = 'H';

    // If logo is present, force at least 'Q' or 'H' error correction so the QR code scans reliably
    if (opts.logoUrl && (ecl === 'L' || ecl === 'M')) {
      ecl = 'H';
    }

    const qrOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: ecl,
      margin: opts.margin,
      width: opts.size,
      color: {
        dark: opts.foregroundColor === 'transparent' ? '#00000000' : opts.foregroundColor,
        light: opts.backgroundColor === 'transparent' ? '#00000000' : opts.backgroundColor,
      },
    };

    let qrCodeOutput = '';

    if (opts.format === 'svg') {
      const svgString = await QRCode.toString(formattedContent, {
        ...qrOptions,
        type: 'svg',
      });

      // If logo is specified, inject logo overlay into SVG
      if (opts.logoUrl) {
        qrCodeOutput = this.embedLogoInSvg(svgString, opts.logoUrl, opts.size || 300);
      } else {
        qrCodeOutput = svgString;
      }
    } else {
      // PNG / DataURL
      const dataUrl = await QRCode.toDataURL(formattedContent, qrOptions);

      // If logo is provided and format is svg/dataUrl, we can overlay or return enhanced data URL
      qrCodeOutput = dataUrl;
    }

    return {
      format: opts.format || 'png',
      qrCode: qrCodeOutput,
      type,
      formattedContent,
      options: opts,
    };
  }

  /**
   * Embeds a logo image in the center of an SVG QR code
   */
  private static embedLogoInSvg(svgString: string, logoUrl: string, size: number): string {
    const logoSize = Math.round(size * 0.22);
    const center = Math.round(size / 2);
    const logoPos = center - Math.round(logoSize / 2);
    const bgPadding = 4;
    const bgPos = logoPos - bgPadding;
    const bgSize = logoSize + bgPadding * 2;

    const overlay = `
      <g id="qr-logo-overlay">
        <rect x="${bgPos}" y="${bgPos}" width="${bgSize}" height="${bgSize}" fill="#ffffff" rx="6" ry="6" />
        <image href="${logoUrl}" x="${logoPos}" y="${logoPos}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice" />
      </g>
    </svg>`;

    return svgString.replace('</svg>', overlay);
  }

  /**
   * Authenticated user creates and saves QR code
   */
  static async createAndSave(userId: string, payload: GenerateQrInput) {
    const result = await this.generate(payload);

    const title = payload.title || `${(payload.type || 'text').toUpperCase()} QR Code`;

    const savedDoc = await DbAdapter.createQRCode({
      userId,
      title,
      type: result.type,
      data: payload.data || payload,
      formattedContent: result.formattedContent,
      options: result.options as any,
      imageUrl: result.qrCode,
      format: result.format,
    });

    logger.info(`User ${userId} created and saved QR code: ${savedDoc.id || savedDoc._id}`);

    return {
      id: savedDoc.id || savedDoc._id,
      title: savedDoc.title,
      type: savedDoc.type,
      data: savedDoc.data,
      formattedContent: savedDoc.formattedContent,
      options: savedDoc.options,
      imageUrl: savedDoc.imageUrl,
      format: savedDoc.format,
      createdAt: savedDoc.createdAt,
      updatedAt: savedDoc.updatedAt,
    };
  }

  /**
   * Get user's saved QR codes with pagination, search, filter, and sort
   */
  static async getUserQRCodes(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
      sort?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return DbAdapter.findUserQRCodes(userId, query);
  }

  /**
   * Get single QR code by ID with ownership verification
   */
  static async getQRCodeById(id: string, userId: string) {
    const qr = await DbAdapter.findQRCodeById(id);
    if (!qr) {
      throw new NotFoundError('QR Code not found');
    }

    if (qr.userId && qr.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to access this QR code');
    }

    return qr;
  }

  /**
   * Delete QR code by ID with ownership check
   */
  static async deleteQRCode(id: string, userId: string) {
    const deleted = await DbAdapter.deleteQRCode(id, userId);
    if (!deleted) {
      throw new NotFoundError('QR Code not found or you do not have permission to delete it');
    }
    return { id, deleted: true };
  }
}
