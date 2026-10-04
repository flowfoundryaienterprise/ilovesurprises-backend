import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Shopping Cart API', () => {
  const app = createApp();
  const testCartId = `guest-cart-test-${Date.now()}`;
  let addedItemId: string;

  it('GET /api/cart should return an empty cart for new session', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('x-cart-id', testCartId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.cart.itemCount).toBe(0);
    expect(res.body.data.cart.subtotal).toBe(0);
    expect(res.body.data.cart.shipping).toBe(0);
    expect(res.body.data.cart.freeShippingThreshold).toBe(50);
  });

  it('POST /api/cart/items should add Halloween product with ring size and scent', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('x-cart-id', testCartId)
      .send({
        productId: 'prod-halloween-bath-bomb-01',
        quantity: 1,
        selectedRingSize: '7',
        selectedScent: '1. Pumpkin Spice 🎃 (Halloween Priority Scent)',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    const cart = res.body.data.cart;
    expect(cart.itemCount).toBe(1);
    expect(cart.subtotal).toBe(19.99);
    expect(cart.freeShippingEligible).toBe(false);
    expect(cart.shipping).toBe(5.99);
    expect(cart.amountNeededForFreeShipping).toBe(30.01);

    expect(cart.items.length).toBe(1);
    const item = cart.items[0];
    expect(item.selectedRingSize).toBe('7');
    expect(item.selectedScent).toContain('Pumpkin Spice');
    expect(item.quantity).toBe(1);
    expect(item.lineTotal).toBe(19.99);

    addedItemId = item.id;
  });

  it('PATCH /api/cart/items/:itemId should update quantity to 3 and trigger free shipping (> $50)', async () => {
    expect(addedItemId).toBeDefined();

    const res = await request(app)
      .patch(`/api/cart/items/${addedItemId}`)
      .set('x-cart-id', testCartId)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    const cart = res.body.data.cart;
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBe(59.97); // 19.99 * 3
    expect(cart.freeShippingEligible).toBe(true);
    expect(cart.shipping).toBe(0);
    expect(cart.total).toBe(59.97);
    expect(cart.amountNeededForFreeShipping).toBe(0);
  });

  it('DELETE /api/cart/items/:itemId should remove the item from cart', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${addedItemId}`)
      .set('x-cart-id', testCartId);

    expect(res.status).toBe(200);
    expect(res.body.data.cart.itemCount).toBe(0);
    expect(res.body.data.cart.items.length).toBe(0);
  });

  it('DELETE /api/cart should clear the entire cart', async () => {
    // Add item first
    await request(app)
      .post('/api/cart/items')
      .set('x-cart-id', testCartId)
      .send({
        productId: 'prod-halloween-bath-bomb-01',
        quantity: 2,
      });

    const clearRes = await request(app)
      .delete('/api/cart')
      .set('x-cart-id', testCartId);

    expect(clearRes.status).toBe(200);
    expect(clearRes.body.data.cart.itemCount).toBe(0);
    expect(clearRes.body.data.cart.items).toEqual([]);
  });
});
