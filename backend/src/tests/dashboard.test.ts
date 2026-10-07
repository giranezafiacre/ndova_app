import request from 'supertest';
import app from '../app';

let adminToken = '';
let providerToken = '';
let clientToken = '';

beforeAll(async () => {
  const [adminRes, providerRes, clientRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'admin@ndova.com', password: 'Admin@123' }),
    request(app).post('/api/auth/login').send({ email: 'provider@ndova.com', password: 'Provider@123' }),
    request(app).post('/api/auth/login').send({ email: 'client@ndova.com', password: 'Client@123' }),
  ]);
  adminToken = adminRes.body.data.token;
  providerToken = providerRes.body.data.token;
  clientToken = clientRes.body.data.token;
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/client
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/client', () => {
  it('200 — CLIENT gets their dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/client')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, recentAppointments } = res.body.data;

    // Summary shape
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('pending');
    expect(summary).toHaveProperty('approved');
    expect(summary).toHaveProperty('completed');
    expect(summary).toHaveProperty('cancelled');
    expect(summary).toHaveProperty('rejected');

    // Counts must be non-negative numbers
    Object.values(summary).forEach((v) => {
      expect(typeof v).toBe('number');
      expect(v as number).toBeGreaterThanOrEqual(0);
    });

    // total = sum of all statuses
    expect(summary.total).toBe(
      summary.pending + summary.approved + summary.rejected +
      summary.cancelled + summary.completed
    );

    expect(Array.isArray(recentAppointments)).toBe(true);
    expect(recentAppointments.length).toBeLessThanOrEqual(5);
  });

  it('403 — PROVIDER is forbidden from client dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/client')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('403 — ADMIN is forbidden from client dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/client')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
  });

  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/dashboard/client');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/provider
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/provider', () => {
  it('200 — PROVIDER gets their dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/provider')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, recentAppointments } = res.body.data;

    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('pending');
    expect(summary).toHaveProperty('approved');
    expect(summary).toHaveProperty('completed');
    expect(summary).toHaveProperty('cancelled');
    expect(summary).toHaveProperty('rejected');

    Object.values(summary).forEach((v) => {
      expect(typeof v).toBe('number');
      expect(v as number).toBeGreaterThanOrEqual(0);
    });

    expect(Array.isArray(recentAppointments)).toBe(true);
    expect(recentAppointments.length).toBeLessThanOrEqual(5);
  });

  it('403 — CLIENT is forbidden from provider dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/provider')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/dashboard/provider');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/dashboard/admin
// ---------------------------------------------------------------------------
describe('GET /api/dashboard/admin', () => {
  it('200 — ADMIN gets the full system dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { users, services, appointments, recentAppointments } = res.body.data;

    // User counts
    expect(users).toHaveProperty('total');
    expect(users).toHaveProperty('clients');
    expect(users).toHaveProperty('providers');
    expect(users.total).toBeGreaterThan(0);
    expect(users.clients).toBeGreaterThan(0);
    expect(users.providers).toBeGreaterThan(0);

    // Service counts
    expect(services).toHaveProperty('total');
    expect(services.total).toBeGreaterThan(0);

    // Appointment counts
    expect(appointments).toHaveProperty('total');
    expect(appointments).toHaveProperty('pending');
    expect(appointments).toHaveProperty('approved');
    expect(appointments).toHaveProperty('rejected');
    expect(appointments).toHaveProperty('cancelled');
    expect(appointments).toHaveProperty('completed');

    Object.values(appointments).forEach((v) => {
      expect(typeof v).toBe('number');
      expect(v as number).toBeGreaterThanOrEqual(0);
    });

    // total = sum of all statuses
    expect(appointments.total).toBe(
      appointments.pending + appointments.approved + appointments.rejected +
      appointments.cancelled + appointments.completed
    );

    // Recent appointments: at most 5, each with client + service associations
    expect(Array.isArray(recentAppointments)).toBe(true);
    expect(recentAppointments.length).toBeLessThanOrEqual(5);
    if (recentAppointments.length > 0) {
      expect(recentAppointments[0]).toHaveProperty('client');
      expect(recentAppointments[0]).toHaveProperty('service');
    }
  });

  it('403 — CLIENT is forbidden from admin dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  it('403 — PROVIDER is forbidden from admin dashboard', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(403);
  });

  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/dashboard/admin');
    expect(res.status).toBe(401);
  });
});
