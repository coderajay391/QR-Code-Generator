import request from 'supertest';
import { app } from '../src/app';

describe('QR Code Generation & Management API', () => {
  let userToken = '';
  let createdQrId = '';

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'QR Tester',
        email: `qrtester_${Date.now()}@example.com`,
        password: 'Password123!',
      });
    userToken = regRes.body.data.token;
  });

  it('POST /api/v1/qr/generate - generates basic text/URL QR code anonymously', async () => {
    const res = await request(app)
      .post('/api/v1/qr/generate')
      .send({
        data: 'https://example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.qrCode).toBeDefined();
    expect(res.body.data.format).toBe('png');
  });

  it('POST /api/v1/qr/generate - generates Wi-Fi QR Code with WPA encryption', async () => {
    const res = await request(app)
      .post('/api/v1/qr/generate')
      .send({
        type: 'wifi',
        ssid: 'MyHomeWiFi',
        password: 'SecretWifiPassword',
        encryption: 'WPA',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.formattedContent).toContain('WIFI:T:WPA;S:MyHomeWiFi;P:SecretWifiPassword;');
  });

  it('POST /api/v1/qr/generate - generates vCard contact QR Code', async () => {
    const res = await request(app)
      .post('/api/v1/qr/generate')
      .send({
        type: 'vcard',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        company: 'Example Inc',
        website: 'https://example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.formattedContent).toContain('BEGIN:VCARD');
    expect(res.body.data.formattedContent).toContain('FN:John Doe');
    expect(res.body.data.formattedContent).toContain('TEL;TYPE=CELL:+1234567890');
    expect(res.body.data.formattedContent).toContain('EMAIL;TYPE=INTERNET:john@example.com');
  });

  it('POST /api/v1/qr/generate - generates SVG format with custom styling', async () => {
    const res = await request(app)
      .post('/api/v1/qr/generate')
      .send({
        type: 'url',
        data: 'https://github.com',
        options: {
          size: 450,
          margin: 2,
          errorCorrectionLevel: 'H',
          foregroundColor: '#0f172a',
          backgroundColor: '#f8fafc',
          format: 'svg',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.format).toBe('svg');
    expect(res.body.data.qrCode).toContain('<svg');
  });

  it('POST /api/v1/qr - authenticated user saves QR code to history', async () => {
    const res = await request(app)
      .post('/api/v1/qr')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Work Email QR',
        type: 'email',
        email: 'boss@enterprise.com',
        subject: 'Weekly Review',
        body: 'Please review the attached notes.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Work Email QR');
    createdQrId = res.body.data.id;
  });

  it('GET /api/v1/qr - lists user saved QR codes with pagination and filtering', async () => {
    const res = await request(app)
      .get('/api/v1/qr?page=1&limit=10&type=email')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/qr/:id - retrieves specific QR code', async () => {
    const res = await request(app)
      .get(`/api/v1/qr/${createdQrId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Work Email QR');
  });

  it('DELETE /api/v1/qr/:id - deletes QR code', async () => {
    const res = await request(app)
      .delete(`/api/v1/qr/${createdQrId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });
});
