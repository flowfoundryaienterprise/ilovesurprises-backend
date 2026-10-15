import { beforeEach, describe, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({
  order: vi.fn(), ordersUpdate: vi.fn(), transactionsUpdate: vi.fn(), productUpdate: vi.fn(),
  products: vi.fn(), affiliate: vi.fn(), commission: vi.fn(), transaction: vi.fn(), clearCart: vi.fn(),
}));
vi.mock('../../src/lib/prisma', () => ({ prisma: {
  products: { findMany: m.products }, affiliate_profiles: { findUnique: m.affiliate },
  orders: { findUnique: m.order, findFirst: m.order }, $transaction: m.transaction,
} }));
vi.mock('../../src/services/commission.service', () => ({ processOrderCommission: m.commission }));
vi.mock('../../src/services/cart.service', () => ({ clearCart: m.clearCart }));
import { createCheckout, markOrderPaid, getOrderForUser } from '../../src/services/payment.service';
const tx = { orders: { updateMany: m.ordersUpdate }, payment_transactions: { updateMany: m.transactionsUpdate }, products: { update: m.productUpdate } };
beforeEach(() => {
  vi.resetAllMocks();
  m.transaction.mockImplementation((fn: any) => fn(tx));
});
describe('payment integrity', () => {
  it('aggregates repeated product lines before stock checks', async () => {
    m.products.mockResolvedValue([{ id: 'p', name: 'Product', status: 'ACTIVE', stock: 3, price: 10, product_variants: [], ringSizes: [] }]);
    await expect(createCheckout('user', { paymentMethod: 'cod', items: [{ productId: 'p', quantity: 2 }, { productId: 'p', quantity: 2 }], deliveryMethodId: 'standard', shippingAddress: {} } as any)).rejects.toThrow('stock');
    expect(m.transaction).not.toHaveBeenCalled();
  });
  it('does not price a variant-bearing product at its base price', async () => {
    m.products.mockResolvedValue([{ id: 'p', status: 'ACTIVE', stock: 10, price: 10, product_variants: [{ isActive: true }], ringSizes: [] }]);
    await expect(createCheckout('user', { paymentMethod: 'cod', items: [{ productId: 'p', quantity: 1 }], deliveryMethodId: 'standard', shippingAddress: {} } as any)).rejects.toThrow('Variant checkout');
  });
  it('retries commissions for an already-paid order without deducting stock twice', async () => {
    m.order.mockResolvedValue({ id: 'o', userId: 'u', paymentMethod: 'STRIPE', paymentStatus: 'PAID', inventoryDeducted: true, totalAmount: 10, order_items: [] });
    m.ordersUpdate.mockResolvedValue({ count: 0 });
    m.commission.mockRejectedValueOnce(new Error('temporary ledger failure')).mockResolvedValueOnce({ status: 'success' });
    const session = { id: 'cs_test', metadata: { orderId: 'o' }, amount_total: 1000, currency: 'usd', payment_status: 'paid' } as any;
    await expect(markOrderPaid(session)).rejects.toThrow('ledger failure');
    await markOrderPaid(session);
    expect(m.commission).toHaveBeenCalledTimes(2);
    expect(m.productUpdate).not.toHaveBeenCalled();
    expect(m.transactionsUpdate).not.toHaveBeenCalled();
  });
  it('does not accept an unpaid session', async () => {
    await markOrderPaid({ metadata: { orderId: 'o' }, payment_status: 'unpaid' } as any);
    expect(m.transaction).not.toHaveBeenCalled();
  });
  it('scopes order retrieval to its owner', async () => {
    m.order.mockResolvedValue(null);
    await expect(getOrderForUser('someone-elses-order', 'customer')).rejects.toMatchObject({ statusCode: 404 });
    expect(m.order).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'someone-elses-order', userId: 'customer' } }));
  });
});
