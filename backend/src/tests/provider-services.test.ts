import request from 'supertest';
import app from '../app';
import { ProviderService, Service } from '../models';

let adminToken = '';
let providerToken = '';
let clientToken = '';
let serviceId = '';
let providerServiceId = '';

beforeAll(async () => {
  const [adminRes, providerRes, clientRes] = await Promise.all([
    request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ndova.com', password: 'Admin@123' }),
    request(app)
      .post('/api/auth/login')
      .send({ email: 'provider@ndova.com', password: 'Provider@123' }),
    request(app)
      .post('/api/auth/login')
      .send({ email: 'client@ndova.com', password: 'Client@123' }),
  ]);

  adminToken = adminRes.body.data.token;
  providerToken = providerRes.body.data.token;
  clientToken = clientRes.body.data.token;

  const serviceRes = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `Provider Service Test ${Date.now()}`,
      description: 'Catalog service for provider-service tests.',
    });
  serviceId = serviceRes.body.data.id;
});

afterAll(async () => {
  if (providerServiceId) {
    await ProviderService.destroy({ where: { id: providerServiceId } }).catch(() => {});
  }
  if (serviceId) {
    await Service.destroy({ where: { id: serviceId } }).catch(() => {});
  }
});

describe('Provider services', () => {
  it('201 — PROVIDER creates an offering from a catalog service', async () => {
    const res = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        serviceId,
        location: 'Kigali',
        description: 'A provider-specific version of the catalog service.',
        durationMinutes: 45,
        imageUrl: 'https://example.com/service.jpg',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      serviceId,
      location: 'Kigali',
      durationMinutes: 45,
      stars: 0,
      imageUrl: 'https://example.com/service.jpg',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    });
    expect(res.body.data.service).toHaveProperty('id', serviceId);
    expect(res.body.data.provider).toHaveProperty('email', 'provider@ndova.com');

    providerServiceId = res.body.data.id;
  });

  it('200 — public listing includes provider and service details', async () => {
    const res = await request(app).get('/api/provider-services');

    expect(res.status).toBe(200);
    expect(
      res.body.data.some((offering: { id: string }) => offering.id === providerServiceId)
    ).toBe(true);
  });

  it('403 — CLIENT cannot create a provider service', async () => {
    const res = await request(app)
      .post('/api/provider-services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId,
        location: 'Kigali',
        description: 'Not allowed.',
        durationMinutes: 30,
      });

    expect(res.status).toBe(403);
  });

  it('200 — PROVIDER updates their offering details', async () => {
    const res = await request(app)
      .patch(`/api/provider-services/${providerServiceId}`)
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        location: 'Kacyiru, Kigali',
        description: 'Updated provider-specific service.',
        durationMinutes: 60,
        imageUrl: 'https://example.com/updated-service.jpg',
        meetingLink: 'https://zoom.us/j/123456789',
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      location: 'Kacyiru, Kigali',
      durationMinutes: 60,
      imageUrl: 'https://example.com/updated-service.jpg',
      meetingLink: 'https://zoom.us/j/123456789',
    });
  });
});
