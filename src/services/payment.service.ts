import crypto from 'crypto';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { config } from '../config/env';
import { processOrderCommission } from './commission.service';
import { clearCart } from './cart.service';
import { CreateCheckoutDTO } from '../types/payment.types';

/**
 * Checkout and payment processing.
 *
 * Every amount is computed here from database prices; client-sent prices are
 * never trusted. An order only becomes PAID when Stripe confirms it, either
 * through the webhook or a direct session lookup, and both paths go through
 * the same idempotent markOrderPaid().
 */

export class PaymentError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
  }
}

let stripeClient: Stripe | null = null;

export const isStripeConfigured = (): boolean => Boolean(config.stripeSecretKey);

const getStripe = (): Stripe => {
  if (!config.stripeSecretKey) {
    throw new PaymentError('Card payments are not configured on the server.', 503);
  }
  if (!stripeClient) stripeClient = new Stripe(config.stripeSecretKey);
  return stripeClient;
};

const FREE_SHIPPING_THRESHOLD_CENTS = 5000;
const SHIPPING_CENTS = { standard: 499, express: 1499 } as const;
const REP_PERSONAL_DISCOUNT_PERCENT = 20;

const toMoney = (cents: number) => new Prisma.Decimal(cents).div(100);
const toCents = (value: Prisma.Decimal | number) => Math.round(Number(value) * 100);

/** Resolves an active, in-date coupon and the discount it gives on a subtotal. */
const resolveCouponDiscount = async (code: string, subtotalCents: number) => {
  const coupon = await prisma.discount_coupons.findFirst({
    where: { code: { equals: code.trim(), mode: 'insensitive' }, isActive: true },
  });
  const now = new Date();
  if (
    !coupon ||
    coupon.startDate > now ||
    (coupon.endDate && coupon.endDate < now) ||
    (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) ||
    (coupon.minOrderAmount && subtotalCents < toCents(coupon.minOrderAmount))
  ) {
    throw new PaymentError(`Promo code '${code}' is not valid for this order.`);
  }

  let discountCents = /percent/i.test(coupon.discountType)
    ? Math.round((subtotalCents * Number(coupon.discountValue)) / 100)
    : toCents(coupon.discountValue);
  if (coupon.maxDiscountAmount) discountCents = Math.min(discountCents, toCents(coupon.maxDiscountAmount));
  return { coupon, discountCents: Math.min(discountCents, subtotalCents) };
};

const generateOrderNumber = () =>
  `ILS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

/**
 * Creates a PENDING order priced from the database. For card payments it also
 * opens a Stripe Checkout session and returns its URL.
 */
/** Storefront origins Stripe may send customers back to. */
const ALLOWED_RETURN_ORIGINS = [
  'https://ilovesurprises.com',
  'https://www.ilovesurprises.com',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

// The customer returns to the site they checked out from, but only if it is on
// the allowlist; anything else falls back to FRONTEND_URL.
const resolveReturnBaseUrl = (requestOrigin?: string): string => {
  const origin = requestOrigin?.replace(/\/+$/, '');
  return origin && ALLOWED_RETURN_ORIGINS.includes(origin) ? origin : config.frontendUrl;
};

export const createCheckout = async (userId: string, input: CreateCheckoutDTO, requestOrigin?: string) => {
  const returnBaseUrl = resolveReturnBaseUrl(requestOrigin);
  if (input.paymentMethod === 'paypal') {
    throw new PaymentError('PayPal is not available yet. Please pay by card, Apple Pay or Google Pay.');
  }
  const isCod = input.paymentMethod === 'cod';
  if (!isCod) getStripe(); // fail fast before writing an order

  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  const productIds = [...quantities.keys()];
  const products = await prisma.products.findMany({ where: { id: { in: productIds } }, include: { product_variants: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new PaymentError('An item in your bag is no longer available. Please remove it and try again.');
    }
    if (product.stock < quantities.get(item.productId)!) {
      throw new PaymentError(`'${product.name}' only has ${product.stock} left in stock.`);
    }
    if (product.product_variants.some((variant) => variant.isActive)) {
      throw new PaymentError('Variant checkout is temporarily unavailable for this product.', 409);
    }
    if (item.selectedRingSize && !product.ringSizes.includes(item.selectedRingSize)) {
      throw new PaymentError('Invalid ring size for this product.');
    }
    const unitCents = toCents(product.price);
    return { item, product, unitCents, lineCents: unitCents * item.quantity };
  });

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineCents, 0);

  // The rep personal discount is decided by the account, not by anything the
  // browser claims. It replaces promo codes rather than stacking with them.
  const repProfile = await prisma.affiliate_profiles.findUnique({ where: { userId } });
  let discountCents = 0;
  let coupon: Awaited<ReturnType<typeof resolveCouponDiscount>>['coupon'] | null = null;
  if (repProfile?.isActive) {
    discountCents = Math.round((subtotalCents * REP_PERSONAL_DISCOUNT_PERCENT) / 100);
  } else if (input.promoCode) {
    const resolved = await resolveCouponDiscount(input.promoCode, subtotalCents);
    coupon = resolved.coupon;
    discountCents = resolved.discountCents;
  }

  const discountedCents = subtotalCents - discountCents;
  const shippingCents =
    input.deliveryMethodId === 'express'
      ? SHIPPING_CENTS.express
      : discountedCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? 0
        : SHIPPING_CENTS.standard;
  const totalCents = discountedCents + shippingCents;

  // Attribution: never to the buyer themselves.
  let attributedAffiliateId: string | null = null;
  if (input.repUsername) {
    const rep = await prisma.affiliate_profiles.findFirst({
      where: {
        OR: [
          { username: { equals: input.repUsername.trim(), mode: 'insensitive' } },
          { referralCode: { equals: input.repUsername.trim(), mode: 'insensitive' } },
          { slug: { equals: input.repUsername.trim(), mode: 'insensitive' } },
        ],
        isActive: true,
      },
    });
    if (rep && rep.userId !== userId) attributedAffiliateId = rep.id;
  }

  const now = new Date();
  const orderId = crypto.randomUUID();
  const order = await prisma.$transaction(async (tx) => {
    // Conditional updates lock inventory rows. Stable ordering avoids cross-product deadlocks.
    for (const productId of [...productIds].sort()) {
      const quantity = quantities.get(productId)!;
      const reserved = await tx.products.updateMany({
        where: { id: productId, status: 'ACTIVE', stock: { gte: quantity }, price: productMap.get(productId)!.price },
        data: { stock: { decrement: quantity } },
      });
      if (reserved.count !== 1) throw new PaymentError('Inventory or price changed. Please refresh your bag.', 409);
      const product = await tx.products.findUniqueOrThrow({ where: { id: productId } });
      await tx.inventory_logs.create({ data: {
        id: crypto.randomUUID(), productId, changeQty: -quantity,
        previousQty: product.stock + quantity, newQty: product.stock,
        reason: 'Reservation for order ' + orderId,
      } });
    }
    return tx.orders.create({
    data: {
      id: orderId,
      orderNumber: generateOrderNumber(),
      userId,
      status: isCod ? 'CONFIRMED' : 'PENDING',
      paymentStatus: 'PENDING',
      inventoryDeducted: true,
      paymentMethod: isCod ? 'COD' : 'STRIPE',
      currency: 'USD',
      subtotal: toMoney(subtotalCents),
      shippingFee: toMoney(shippingCents),
      discountAmount: toMoney(discountCents),
      totalAmount: toMoney(totalCents),
      attributedAffiliateId,
      customerNote: input.notes,
      shippingAddressSnapshot: {
        ...input.shippingAddress,
        deliveryMethodId: input.deliveryMethodId,
        promoCode: coupon?.code ?? (repProfile?.isActive ? 'REP_20_PERSONAL' : undefined),
        couponId: coupon?.id,
      } as Prisma.InputJsonValue,
      updatedAt: now,
      payment_transactions: { create: {
        id: crypto.randomUUID(), paymentMethod: isCod ? 'COD' : 'STRIPE',
        amount: toMoney(totalCents), currency: 'USD', status: 'PENDING', updatedAt: now,
      } },
      order_items: {
        create: lines.map(({ item, product, unitCents, lineCents }) => ({
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: toMoney(unitCents),
          quantity: item.quantity,
          lineTotal: toMoney(lineCents),
          selectedRingSize: item.selectedRingSize,
          customNote: item.selectedSurpriseOption,
          imageUrl: product.imageUrl,
          isCommissionEligible: product.isCommissionEligible,
          updatedAt: now,
        })),
      },
    },
  });

  });

  if (isCod) {
    await clearCart(userId).catch(() => undefined);
    return { order: await getOrderForUser(order.id, userId), checkoutUrl: null };
  }

  const stripe = getStripe();
  let stripeCouponId: string | undefined;
  if (discountCents > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: discountCents,
      currency: 'usd',
      duration: 'once',
      max_redemptions: 1,
      name: repProfile?.isActive ? 'Rep personal discount' : `Promo ${coupon?.code}`,
    });
    stripeCouponId = stripeCoupon.id;
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      client_reference_id: order.id,
      customer_email: input.shippingAddress.email,
      line_items: lines.map(({ product, unitCents, item }) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: unitCents,
          product_data: {
            name: product.name,
            ...(product.imageUrl?.startsWith('https://') ? { images: [product.imageUrl] } : {}),
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: input.deliveryMethodId === 'express' ? 'Priority Express' : 'Standard Tracked Delivery',
            fixed_amount: { amount: shippingCents, currency: 'usd' },
          },
        },
      ],
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber } },
      success_url: `${returnBaseUrl}/order-confirmation?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnBaseUrl}/payment?payment_status=cancelled&order_id=${order.id}`,
    },
    { idempotencyKey: `checkout-${order.id}` }
  );

  await prisma.payment_transactions.updateMany({
    where: { orderId: order.id, status: 'PENDING' },
    data: { gatewayResponse: { checkoutSessionId: session.id }, updatedAt: new Date() },
  });

  return { order: null, orderId: order.id, checkoutUrl: session.url, sessionId: session.id };
};

/**
 * Marks an order paid from a completed Checkout session. Safe to call more
 * than once (webhook retries, status polling): only the first call that moves
 * the order out of a non-PAID state performs the side effects.
 */
export const markOrderPaid = async (session: Stripe.Checkout.Session): Promise<void> => {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId || session.payment_status !== 'paid') return;

  const order = await prisma.orders.findUnique({ where: { id: orderId }, include: { order_items: true } });
  if (!order || order.paymentMethod !== 'STRIPE') throw new PaymentError('Payment order cannot be reconciled', 409);

  if (session.amount_total !== toCents(order.totalAmount) || session.currency !== 'usd') {
    console.error(
      `[payments] Amount mismatch for order ${order.orderNumber}: Stripe ${session.amount_total} ${session.currency}, order ${toCents(order.totalAmount)} usd`
    );
    throw new PaymentError('Payment amount requires reconciliation', 409);
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  const transitioned = await prisma.$transaction(async (tx) => {
    const { count } = await tx.orders.updateMany({
      where: { id: orderId, paymentStatus: 'PENDING', status: { not: 'CANCELLED' } },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED', inventoryDeducted: true, updatedAt: new Date() },
    });
    if (count === 0) return false;

    await tx.payment_transactions.updateMany({
      where: { orderId },
      data: {
        status: 'PAID',
        stripePaymentIntentId: paymentIntentId ?? null,
        gatewayResponse: { checkoutSessionId: session.id, paymentIntentId: paymentIntentId ?? null },
        updatedAt: new Date(),
      },
    });

    if (!order.inventoryDeducted) for (const item of order.order_items) {
      if (!item.productId) continue;
      const updated = await tx.products.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) throw new PaymentError('Legacy order requires inventory reconciliation', 409);
      const product = await tx.products.findUniqueOrThrow({ where: { id: item.productId } });
      await tx.inventory_logs.create({
        data: {
          id: crypto.randomUUID(),
          productId: item.productId,
          changeQty: -item.quantity,
          previousQty: product.stock + item.quantity,
          newQty: product.stock,
          reason: `Order ${order.orderNumber} paid`,
        },
      });
    }

    const snapshot = order.shippingAddressSnapshot as { couponId?: string } | null;
    if (snapshot?.couponId) {
      await tx.discount_coupons.update({
        where: { id: snapshot.couponId },
        data: { currentUses: { increment: 1 } },
      });
      await tx.coupon_usages.create({
        data: {
          id: crypto.randomUUID(),
          couponId: snapshot.couponId,
          userId: order.userId,
          orderId,
          discountApplied: order.discountAmount,
        },
      });
    }
    return true;
  });

  // A verified webhook retry must retry the idempotent commission transaction.
  if (transitioned || order.paymentStatus === 'PAID') await processOrderCommission(orderId);
  if (transitioned) await clearCart(order.userId);
};

const markOrderFailed = async (orderId: string, reason: string) => {
  await prisma.$transaction(async (tx) => {
    const changed = await tx.orders.updateMany({
      where: { id: orderId, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'FAILED', status: 'CANCELLED', updatedAt: new Date() },
    });
    if (!changed.count) return;
    const order = await tx.orders.findUniqueOrThrow({ where: { id: orderId }, include: { order_items: true } });
    if (order.inventoryDeducted) {
      for (const item of [...order.order_items].sort((a, b) => (a.productId || '').localeCompare(b.productId || ''))) {
        if (!item.productId) continue;
        const product = await tx.products.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await tx.inventory_logs.create({ data: {
          id: crypto.randomUUID(), productId: item.productId, changeQty: item.quantity,
          previousQty: product.stock - item.quantity, newQty: product.stock, reason: 'Release for order ' + orderId,
        } });
      }
      await tx.orders.update({ where: { id: orderId }, data: { inventoryDeducted: false } });
    }
    await tx.payment_transactions.updateMany({
      where: { orderId, status: 'PENDING' },
      data: { status: 'FAILED', errorMessage: reason, updatedAt: new Date() },
    });
  });
};

export const cancelUnpaidOrder = async (orderId: string, userId: string) => {
  const order = await prisma.orders.findFirst({ where: { id: orderId, userId }, include: { payment_transactions: true } });
  if (!order) throw new PaymentError('Order not found.', 404);
  if (order.status === 'CANCELLED') return getOrderForUser(orderId, userId);
  if (order.paymentStatus !== 'PENDING' || !['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new PaymentError('This order cannot be cancelled.', 409);
  }
  if (order.paymentMethod === 'STRIPE') {
    const sessionId = (order.payment_transactions[0]?.gatewayResponse as { checkoutSessionId?: string } | null)?.checkoutSessionId;
    // Unknown gateway outcome requires reconciliation; never release potentially sold stock.
    if (!sessionId) throw new PaymentError('Checkout requires payment reconciliation before cancellation.', 409);
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.status === 'complete') {
      if (session.payment_status === 'paid') await markOrderPaid(session);
      throw new PaymentError('Payment has completed or is processing; cancellation is unavailable.', 409);
    }
    if (session.status === 'open') await getStripe().checkout.sessions.expire(sessionId);
  }
  await markOrderFailed(orderId, 'customer_cancelled');
  return getOrderForUser(orderId, userId);
};

/** Verifies and applies a Stripe webhook event. Throws on a bad signature. */
export const handleWebhook = async (rawBody: Buffer, signature: string | undefined) => {
  if (!config.stripeWebhookSecret) {
    throw new PaymentError('Stripe webhook secret is not configured.', 503);
  }
  if (!signature) throw new PaymentError('Missing Stripe signature.');

  const event = getStripe().webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await markOrderPaid(event.data.object);
      break;
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await markOrderFailed(orderId, event.type);
      break;
    }
    default:
      break;
  }
};

const mapPaymentStatus = (status: string): 'paid' | 'pending' | 'failed' | 'cancelled' => {
  if (status === 'PAID') return 'paid';
  if (status === 'FAILED') return 'failed';
  if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') return 'cancelled';
  return 'pending';
};

/** Loads an order owned by the user in the shape the storefront renders. */
export const getOrderForUser = async (orderId: string, userId: string) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, userId },
    include: { order_items: true, payment_transactions: true, attributed_affiliate: true },
  });
  if (!order) throw new PaymentError('Order not found.', 404);

  const snapshot = (order.shippingAddressSnapshot || {}) as Record<string, any>;
  const deliveryMethodId = snapshot.deliveryMethodId === 'express' ? 'express' : 'standard';
  const etaDays = deliveryMethodId === 'express' ? 1 : 3;
  const eta = new Date(order.createdAt.getTime() + etaDays * 86_400_000).toISOString();
  const txn = order.payment_transactions[0];
  const paymentStatus = mapPaymentStatus(order.paymentStatus);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.order_items.map((i) => ({
      product: { id: i.productId, name: i.productName, image: i.imageUrl, imageUrl: i.imageUrl, price: Number(i.unitPrice) },
      quantity: i.quantity,
      selectedSurpriseOption: i.customNote ?? undefined,
      selectedRingSize: i.selectedRingSize ? Number(i.selectedRingSize) : undefined,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.lineTotal),
    })),
    shippingAddress: {
      fullName: snapshot.fullName,
      email: snapshot.email,
      phone: snapshot.phone,
      addressLine1: snapshot.addressLine1,
      addressLine2: snapshot.addressLine2,
      city: snapshot.city,
      state: snapshot.state,
      zipCode: snapshot.zipCode,
      country: snapshot.country,
    },
    deliveryMethod: {
      id: deliveryMethodId,
      name: deliveryMethodId === 'express' ? 'Priority Express Dispatch' : 'Standard Tracked Delivery',
      subtitle: '',
      price: Number(order.shippingFee),
      estimatedDeliveryDate: eta,
      carrierInfo: '',
    },
    paymentSummary: {
      method: order.paymentMethod === 'COD' ? 'cod' : 'card',
      isPaid: paymentStatus === 'paid',
      transactionId: txn?.stripePaymentIntentId || order.orderNumber,
      paidAt: paymentStatus === 'paid' ? order.updatedAt.toISOString() : '',
      gatewayStatus: paymentStatus === 'paid' ? 'succeeded' : paymentStatus === 'failed' ? 'failed' : 'pending',
      paymentIntentId: txn?.stripePaymentIntentId ?? undefined,
    },
    subtotal: Number(order.subtotal),
    discount: Number(order.discountAmount),
    promoCode: snapshot.promoCode,
    shippingFee: Number(order.shippingFee),
    total: Number(order.totalAmount),
    status: order.status.toLowerCase(),
    paymentStatus,
    estimatedDeliveryDate: eta,
    attributedRep: order.attributed_affiliate
      ? {
          name: order.attributed_affiliate.username || order.attributed_affiliate.referralCode,
          repUsername: order.attributed_affiliate.username || order.attributed_affiliate.referralCode,
        }
      : undefined,
    notes: order.customerNote ?? undefined,
  };
};

/**
 * Returns the authoritative payment status. If the order is still pending, it
 * asks Stripe directly so customers are confirmed even if the webhook lags.
 */
export const getPaymentStatus = async (orderId: string, userId: string) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, userId },
    include: { payment_transactions: true },
  });
  if (!order) throw new PaymentError('Order not found.', 404);

  if (order.paymentMethod === 'STRIPE' && order.paymentStatus === 'PENDING' && isStripeConfigured()) {
    const sessionId = (order.payment_transactions[0]?.gatewayResponse as { checkoutSessionId?: string } | null)
      ?.checkoutSessionId;
    if (sessionId) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') await markOrderPaid(session);
      else if (session.status === 'expired') await markOrderFailed(orderId, 'checkout.session.expired');
    }
  }

  const fresh = await getOrderForUser(orderId, userId);
  return { status: fresh.paymentStatus, order: fresh, transactionId: fresh.paymentSummary.paymentIntentId };
};

export const paymentService = {
  createCheckout,
  handleWebhook,
  getPaymentStatus,
  getOrderForUser,
  markOrderPaid,
  isStripeConfigured,
};
