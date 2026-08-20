import request from 'supertest';
import { app } from '../src/app';

describe('Auth API Endpoints', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  let authToken = '';

  it('POST /api/v1/auth/register - should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Developer',
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(uniqueEmail);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/v1/auth/register - should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Developer Duplicate',
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register - should fail on weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Weak Pass',
        email: `weak_${Date.now()}@example.com`,
        password: 'weak',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/auth/login - should authenticate valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  it('POST /api/v1/auth/login - should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - should return profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail);
  });

  it('GET /api/v1/auth/me - should return 401 when token is missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
