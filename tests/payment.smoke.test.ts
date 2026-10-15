import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('payments API smoke', () => {
  it('requires login to start checkout', async () => {
    const res = await request(app).post('/api/payments/checkout').send({});
    expect(res.status).toBe(401);
  });
  it('requires login for payment status', async () => {
    const res = await request(app).get('/api/payments/orders/x/status');
    expect(res.status).toBe(401);
  });
  it('rejects an unsigned webhook', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'checkout.session.completed' }));
    expect(res.status).toBe(400);
  });
});
