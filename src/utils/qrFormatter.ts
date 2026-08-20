export interface WifiData {
  ssid: string;
  password?: string;
  encryption?: 'WPA' | 'WPA2' | 'WEP' | 'nopass' | 'Open' | string;
  hidden?: boolean;
}

export interface VCardData {
  firstName?: string;
  lastName?: string;
  organization?: string;
  company?: string;
  title?: string;
  phone?: string;
  workPhone?: string;
  email?: string;
  website?: string;
  url?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  note?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface PhoneData {
  phone: string;
}

export interface SmsData {
  phone: string;
  message?: string;
}

export interface GeoData {
  latitude: number | string;
  longitude: number | string;
}

export interface CryptoData {
  currency?: string;
  address: string;
  amount?: number | string;
  message?: string;
}

export class QrFormatter {
  static formatWifi(data: WifiData): string {
    const enc = (data.encryption || 'WPA').toUpperCase();
    const type = enc === 'OPEN' || enc === 'NOPASS' ? 'nopass' : enc.includes('WEP') ? 'WEP' : 'WPA';
    const escapedSSID = (data.ssid || '').replace(/([\\;:"])/g, '\\$1');
    const escapedPass = (data.password || '').replace(/([\\;:"])/g, '\\$1');
    const hidden = data.hidden ? 'H:true;' : '';
    
    if (type === 'nopass') {
      return `WIFI:T:nopass;S:${escapedSSID};${hidden};`;
    }
    return `WIFI:T:${type};S:${escapedSSID};P:${escapedPass};${hidden};`;
  }

  static formatVCard(data: VCardData): string {
    const fn = [data.firstName, data.lastName].filter(Boolean).join(' ');
    const org = data.company || data.organization || '';
    const web = data.website || data.url || '';
    const phone = data.phone || data.workPhone || '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${data.lastName || ''};${data.firstName || ''};;;`,
      `FN:${fn || 'Contact'}`,
    ];

    if (org) lines.push(`ORG:${org}`);
    if (data.title) lines.push(`TITLE:${data.title}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
    if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
    if (web) lines.push(`URL:${web}`);

    if (data.street || data.city || data.state || data.zipCode || data.country) {
      lines.push(
        `ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zipCode || ''};${data.country || ''}`
      );
    }
    if (data.note) lines.push(`NOTE:${data.note}`);

    lines.push('END:VCARD');
    return lines.join('\n');
  }

  static formatEmail(data: EmailData): string {
    const params = new URLSearchParams();
    if (data.subject) params.append('subject', data.subject);
    if (data.body) params.append('body', data.body);
    const queryString = params.toString();
    return `mailto:${data.email}${queryString ? `?${queryString}` : ''}`;
  }

  static formatPhone(data: PhoneData): string {
    const cleanPhone = (data.phone || '').trim();
    return `tel:${cleanPhone}`;
  }

  static formatSms(data: SmsData): string {
    const cleanPhone = (data.phone || '').trim();
    const message = data.message || '';
    if (message) {
      return `smsto:${cleanPhone}:${message}`;
    }
    return `smsto:${cleanPhone}`;
  }

  static formatGeo(data: GeoData): string {
    return `geo:${data.latitude},${data.longitude}`;
  }

  static formatCrypto(data: CryptoData): string {
    const currency = (data.currency || 'bitcoin').toLowerCase();
    const params = new URLSearchParams();
    if (data.amount) params.append('amount', String(data.amount));
    if (data.message) params.append('message', data.message);
    const qs = params.toString();
    return `${currency}:${data.address}${qs ? `?${qs}` : ''}`;
  }

  static formatPayload(type: string, rawData: any): string {
    if (!type || type === 'text') {
      return typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
    }

    if (type === 'url') {
      const urlStr = typeof rawData === 'string' ? rawData : rawData?.url || rawData?.data || '';
      return urlStr;
    }

    if (type === 'wifi') {
      return this.formatWifi(rawData);
    }

    if (type === 'vcard' || type === 'contact') {
      return this.formatVCard(rawData);
    }

    if (type === 'email') {
      return typeof rawData === 'string' ? `mailto:${rawData}` : this.formatEmail(rawData);
    }

    if (type === 'phone') {
      return typeof rawData === 'string' ? `tel:${rawData}` : this.formatPhone(rawData);
    }

    if (type === 'sms') {
      return this.formatSms(rawData);
    }

    if (type === 'geo') {
      return this.formatGeo(rawData);
    }

    if (type === 'crypto') {
      return this.formatCrypto(rawData);
    }

    return typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
  }
}
