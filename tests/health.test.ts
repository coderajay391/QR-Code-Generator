import request from 'supertest';
import { app } from '../src/app';

describe('Health Endpoint', () => {
  it('GET /api/v1/health - returns 200 and healthy operational status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.uptime).toBeDefined();
    expect(res.body.data.database).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
  });
});
