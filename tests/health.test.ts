import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Health & Global Error Handlers', () => {
  const app = createApp();

  it('GET / should return root application info and endpoints map', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('ilovesurprises-backend');
    expect(res.body.status).toBe('running');
    expect(res.body.endpoints).toBeDefined();
    expect(res.body.endpoints.api.products).toBe('/api/products');
    expect(res.body.endpoints.api.storefront).toBe('/api/storefront');
    expect(res.body.endpoints.api.cart).toBe('/api/cart');
  });

  it('GET /health should return healthy status and database connection info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.services.database.status).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptimeSeconds).toBeDefined();
  });

  it('GET /non-existent-route should return structured 404 error', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toBe('Not Found');
    expect(res.body.message).toContain('Cannot GET /non-existent-route');
  });
});
