import { prisma } from '../lib/prisma';
import { stripe, isStripeConfigured } from '../lib/stripe';
import { PaymentStatus, OrderStatus, PaymentMethod } from '@prisma/client';
import {
  CreatePaymentIntentDTO,
  CreatePaymentIntentResponseDTO,
} from '../types/payment.types';
import { affiliateService } from './affiliate.service';
import { notificationService } from './notification.service';

export class PaymentsService {
  async createPaymentIntent(
    userId: string,
    data: CreatePaymentIntentDTO
  ): Promise<CreatePaymentIntentResponseDTO> {
    if (!isStripeConfigured()) {
      const error: any = new Error(
        'Stripe payment gateway is not configured. Please ensure STRIPE_SECRET_KEY is set in environment.'
      );
      error.statusCode = 503;
      throw error;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        userId,
      },
      include: {
        payments: true,
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      const error: any = new Error('Order is already paid');
      error.statusCode = 400;
      throw error;
    }

    if (order.status === OrderStatus.CANCELLED) {
      const error: any = new Error('Cannot process payment for a cancelled order');
      error.statusCode = 400;
      throw error;
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    const existingPayment = order.payments.find(
      (p) => p.paymentMethod === PaymentMethod.STRIPE && p.stripePaymentIntentId
    );

    let clientSecret: string | null = null;
    let paymentIntentId = '';

    if (existingPayment && existingPayment.stripePaymentIntentId) {
      try {
        const intent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);
        if (intent.status === 'requires_payment_method' || intent.status === 'requires_action') {
          clientSecret = intent.client_secret;
          paymentIntentId = intent.id;
        }
      } catch {
        // If retrieve fails (e.g. stale intent), create a fresh one below
      }
    }

    if (!clientSecret) {
      const intent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: order.currency.toLowerCase(),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
        },
      });

      clientSecret = intent.client_secret;
      paymentIntentId = intent.id;

      await prisma.paymentTransaction.upsert({
        where: {
          stripePaymentIntentId: intent.id,
        },
        create: {
          orderId: order.id,
          paymentMethod: PaymentMethod.STRIPE,
          amount: order.totalAmount,
          currency: order.currency,
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: intent.id,
          stripeClientSecret: intent.client_secret,
        },
        update: {
          stripeClientSecret: intent.client_secret,
          amount: order.totalAmount,
          status: PaymentStatus.PENDING,
        },
      });
    }

    return {
      clientSecret,
      paymentIntentId,
      amount: Number(order.totalAmount),
      currency: order.currency,
      orderNumber: order.orderNumber,
    };
  }

  async verifyPayment(data: {
    orderId?: string;
    paymentIntentId?: string;
    sessionId?: string;
    paymentMethod?: string;
  }): Promise<{
    success: boolean;
    verified: boolean;
    status: 'paid' | 'pending' | 'failed' | 'cancelled';
    order?: any;
    transactionId?: string;
    message?: string;
  }> {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(data.orderId ? [{ id: data.orderId }, { orderNumber: data.orderId }] : []),
          ...(data.paymentIntentId ? [{ payments: { some: { stripePaymentIntentId: data.paymentIntentId } } }] : []),
        ],
      },
      include: {
        items: true,
        fulfillments: true,
        payments: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!order) {
      return {
        success: false,
        verified: false,
        status: 'failed',
        message: 'Order not found',
      };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return {
        success: true,
        verified: true,
        status: 'paid',
        order,
        transactionId: order.payments[0]?.id || order.id,
        message: 'Payment already verified and completed',
      };
    }

    if (data.paymentIntentId && isStripeConfigured()) {
      try {
        const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
        if (intent.status === 'succeeded') {
          await this.processSuccessfulPayment(intent);
          const updated = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true, fulfillments: true, payments: true },
          });
          return {
            success: true,
            verified: true,
            status: 'paid',
            order: updated,
            transactionId: intent.id,
            message: 'Payment verified and order confirmed',
          };
        } else if (intent.status === 'requires_action' || intent.status === 'processing') {
          return {
            success: true,
            verified: false,
            status: 'pending',
            order,
            message: 'Payment is being processed by the gateway',
          };
        }
      } catch {
        // Fallback to order status check below
      }
    }

    if (order.paymentMethod === PaymentMethod.COD) {
      return {
        success: true,
        verified: true,
        status: 'paid',
        order,
        message: 'Cash on Delivery order confirmed',
      };
    }

    return {
      success: true,
      verified: false,
      status: 'pending',
      order,
      message: 'Payment verification pending gateway confirmation',
    };
  }


  async handleStripeWebhook(rawBody: Buffer | string, signature: string): Promise<{ received: boolean; status?: string }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      const error: any = new Error(
        'STRIPE_WEBHOOK_SECRET is not configured on the server'
      );
      error.statusCode = 500;
      throw error;
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      const error: any = new Error(`Webhook signature verification failed: ${err.message}`);
      error.statusCode = 400;
      throw error;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.processSuccessfulPayment(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await this.processFailedPayment(paymentIntent);
        break;
      }

      default:
        break;
    }

    return { received: true, status: 'processed' };
  }

  private async processSuccessfulPayment(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;

    let transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentIntent.id },
          ...(orderId ? [{ orderId }] : []),
        ],
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!transaction && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order) {
        transaction = await prisma.paymentTransaction.create({
          data: {
            orderId: order.id,
            paymentMethod: PaymentMethod.STRIPE,
            amount: order.totalAmount,
            currency: order.currency,
            status: PaymentStatus.PENDING,
            stripePaymentIntentId: paymentIntent.id,
          },
          include: {
            order: {
              include: { items: true },
            },
          },
        });
      }
    }

    if (!transaction || !transaction.order) {
      return;
    }

    const { order } = transaction;

    if (order.paymentStatus === PaymentStatus.PAID && order.inventoryDeducted) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: { id: transaction!.id },
        data: {
          status: PaymentStatus.PAID,
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });

      if (!order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.variantId) {
            const v = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId || '',
                variantId: item.variantId,
                changeQty: -item.quantity,
                previousQty: v.stock + item.quantity,
                newQty: v.stock,
                reason: 'ORDER_FULFILLMENT',
                createdBy: order.id,
              },
            });
          } else if (item.productId) {
            const p = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: null,
                changeQty: -item.quantity,
                previousQty: p.stock + item.quantity,
                newQty: p.stock,
                reason: 'ORDER_FULFILLMENT',
                createdBy: order.id,
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          inventoryDeducted: true,
          notes: {
            create: {
              authorRole: 'SYSTEM',
              note: `Payment successfully captured via Stripe (PaymentIntent: ${paymentIntent.id})`,
              isCustomerVisible: false,
            },
          },
        },
      });

      const userCart = await tx.cart.findUnique({
        where: { userId: order.userId },
      });

      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }
    });

    try {
      await affiliateService.processOrderCommissions(order.id);
    } catch (err) {
      // Continue without breaking payment completion
    }

    try {
      await notificationService.createNotification({
        userId: order.userId,
        title: `Payment Confirmed - Order #${order.orderNumber}`,
        message: `Your payment has been successfully verified. Order #${order.orderNumber} is now being processed.`,
        type: 'PAYMENT',
        actionUrl: `/order-confirmation/${order.id}`,
      });
    } catch (err) {
      // Continue without breaking payment completion
    }
  }

  private async processFailedPayment(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;

    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { stripePaymentIntentId: paymentIntent.id },
          ...(orderId ? [{ orderId }] : []),
        ],
      },
    });

    if (transaction) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.FAILED,
          errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
          gatewayResponse: JSON.parse(JSON.stringify(paymentIntent)),
        },
      });

      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });
    }
  }
}

export const paymentsService = new PaymentsService();
