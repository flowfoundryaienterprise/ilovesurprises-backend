import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { signToken } from '../src/utils/jwt';
import { UserRole, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

describe('Admin Orders & Fulfillment Tracking API', () => {
  const app = createApp();
  const testId = `order_test_${Date.now()}`;
  let adminUser: any;
  let adminToken: string;
  let customerUser: any;
  let customerToken: string;
  let otherCustomerUser: any;
  let otherCustomerToken: string;
  let testProduct: any;
  let testOrderId: string;
  let testOrderNumber: string;

  beforeAll(async () => {
     
    adminUser = await prisma.user.create({
      data: {
        email: `${testId}_admin@example.com`,
        passwordHash: 'hash',
        role: UserRole.ADMIN,
        firstName: 'Sarah',
        lastName: 'Admin',
      },
    });
    adminToken = signToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    
    customerUser = await prisma.user.create({
      data: {
        email: `${testId}_customer@example.com`,
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
        firstName: 'Emma',
        lastName: 'Watson',
      },
    });
    customerToken = signToken({
      id: customerUser.id,
      email: customerUser.email,
      role: customerUser.role,
    });

    otherCustomerUser = await prisma.user.create({
      data: {
        email: `${testId}_other@example.com`,
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
        firstName: 'Daniel',
        lastName: 'Radcliffe',
      },
    });
    otherCustomerToken = signToken({
      id: otherCustomerUser.id,
      email: otherCustomerUser.email,
      role: otherCustomerUser.role,
    });

    
    testProduct = await prisma.products.create({
      data: {
        id: crypto.randomUUID(),
        name: `${testId} Mystery Diamond Candle`,
        slug: `${testId}-mystery-diamond-candle`,
        price: 49.99,
        stock: 50,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });
 
    testOrderNumber = `ILS-TEST-${Date.now().toString().slice(-5)}`;
    const order = await prisma.orders.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber: testOrderNumber,
        userId: customerUser.id,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'USD',
        subtotal: 49.99,
        shippingFee: 0.0,
        discountAmount: 0.0,
        totalAmount: 49.99,
        customerNote: 'Please include surprise ring!',
        shippingAddressSnapshot: {
          fullName: 'Emma Watson',
          email: `${testId}_customer@example.com`,
          phone: '555-0199',
          addressLine1: '123 Magic Way',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210',
          country: 'US',
        },
        inventoryDeducted: true,
        updatedAt: new Date(),
        order_items: {
          create: [
            {
              id: crypto.randomUUID(),
              productId: testProduct.id,
              productName: testProduct.name,
              sku: testProduct.sku,
              unitPrice: 49.99,
              quantity: 1,
              lineTotal: 49.99,
              selectedRingSize: '7',
              selectedScent: 'Lavender Breeze',
              customNote: 'Hidden Diamond Surprise',
              updatedAt: new Date(),
            },
          ],
        },
      },
    });
    testOrderId = order.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.refund_records.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order_notes.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order_fulfillments.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order_items.deleteMany({ where: { orderId: testOrderId } });
    await prisma.orders.deleteMany({ where: { id: testOrderId } });
    await prisma.products.deleteMany({ where: { id: testProduct.id } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUser.id, customerUser.id, otherCustomerUser.id] },
      },
    });
  });

  describe('GET /api/admin/orders (Admin Orders Registry)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/orders');
      expect(res.status).toBe(401);
    });

    it('should reject non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('should return paginated orders list matching AdminOrders view model', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();

      const { orders, pagination, summary } = res.body.data;
      expect(Array.isArray(orders)).toBe(true);
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('page', 1);
      expect(pagination).toHaveProperty('limit', 20);
      expect(summary).toHaveProperty('totalOrders');
      expect(summary).toHaveProperty('totalRevenue');

      const found = orders.find((o: any) => o.id === testOrderId);
      expect(found).toBeDefined();
      expect(found.orderNumber).toBe(testOrderNumber);
      expect(found.customerName).toBe('Emma Watson');
      expect(found.customerEmail).toBe(`${testId}_customer@example.com`);
      expect(found.total).toBe(49.99);
      expect(found.paymentStatus).toBe('paid');
      expect(found.itemCount).toBe(1);
      expect(found.itemsSummary).toContain(testProduct.name);
    });

    it('should filter orders by search term (orderNumber or customer name)', async () => {
      const res = await request(app)
        .get(`/api/admin/orders?search=${encodeURIComponent(testOrderNumber)}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const orders = res.body.data.orders;
      expect(orders.length).toBeGreaterThanOrEqual(1);
      expect(orders[0].orderNumber).toBe(testOrderNumber);
    });

    it('should filter orders by status and paymentStatus', async () => {
      const res = await request(app)
        .get('/api/admin/orders?status=confirmed&paymentStatus=paid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const orders = res.body.data.orders;
      const found = orders.find((o: any) => o.id === testOrderId);
      expect(found).toBeDefined();
    });
  });

  describe('GET /api/admin/orders/:id (Detailed Order Manifest)', () => {
    it('should retrieve complete order details by ID or orderNumber', async () => {
      const res = await request(app)
        .get(`/api/admin/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const order = res.body.data.order;
      expect(order.id).toBe(testOrderId);
      expect(order.orderNumber).toBe(testOrderNumber);
      expect(order.items.length).toBe(1);
      expect(order.items[0].productName).toBe(testProduct.name);
      expect(order.items[0].selectedRingSize).toBe('7');
      expect(order.shippingAddressSnapshot.city).toBe('Beverly Hills');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/admin/orders/non-existent-order-id-xyz')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/admin/orders/:id/status (Status Transitions)', () => {
    it('should update order status to PROCESSING', async () => {
      const res = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PROCESSING', notes: 'Candle being hand-poured in workshop' });

      expect(res.status).toBe(200);
      expect(res.body.data.order.status).toBe('processing');
    });
  });

  describe('POST /api/admin/orders/:id/fulfillment (Carrier Tracking & Dispatch)', () => {
    it('should record carrier tracking and mark order as SHIPPED', async () => {
      const trackingNumber = '940011189922315582';
      const res = await request(app)
        .post(`/api/admin/orders/${testOrderId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          carrier: 'USPS',
          trackingNumber,
          status: 'SHIPPED',
          notes: 'Dispatched via Priority Tracked Mail',
        });

      expect(res.status).toBe(200);
      const order = res.body.data.order;
      expect(order.status).toBe('shipped');
      expect(order.carrier).toBe('USPS');
      expect(order.trackingNumber).toBe(trackingNumber);
      expect(order.trackingUrl).toContain('tools.usps.com');
      expect(order.fulfillments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/admin/orders/:id/notes (Admin Order Notes)', () => {
    it('should add an admin internal note to the order', async () => {
      const res = await request(app)
        .post(`/api/admin/orders/${testOrderId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          note: 'Customer called to confirm ring size is 7. Verified.',
          isCustomerVisible: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.note.note).toContain('ring size is 7');
      expect(res.body.data.note.authorRole).toBe('ADMIN');
    });
  });

  describe('POST /api/admin/orders/:id/refund (Order Refund Processing)', () => {
    it('should reject refund amount exceeding order total', async () => {
      const res = await request(app)
        .post(`/api/admin/orders/${testOrderId}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 999.99,
          reason: 'Excessive refund test',
        });

      expect(res.status).toBe(400);
    });

    it('should process full order refund and update payment status to REFUNDED', async () => {
      const res = await request(app)
        .post(`/api/admin/orders/${testOrderId}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 49.99,
          reason: 'Customer return requested',
          restockInventory: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      const { order, refund } = res.body.data;
      expect(order.paymentStatus).toBe('refunded');
      expect(refund.amount).toBe(49.99);
      expect(refund.reason).toBe('Customer return requested');
    });
  });

  describe('GET /api/orders (Customer Order Self-Service)', () => {
    it('should allow customer to view their own orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      const found = res.body.data.orders.find((o: any) => o.id === testOrderId);
      expect(found).toBeDefined();
    });

    it('should prevent other customers from seeing someone else order detail', async () => {
      const res = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${otherCustomerToken}`);

      expect(res.status).toBe(404);
    });
  });
});
