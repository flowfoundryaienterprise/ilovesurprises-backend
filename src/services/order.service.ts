import { prisma } from '../lib/prisma';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfillmentStatus,
  ProductStatus,
  Prisma,
} from '@prisma/client';
import {
  CheckoutDTO,
  CodCheckoutDTO,
  OrderResponseDTO,
  UpdateFulfillmentDTO,
  ListOrdersQueryDTO,
} from '../types/order.types';
import { couponService } from './coupon.service';
import { affiliateService } from './affiliate.service';
import { notificationService } from './notification.service';

export class OrdersService {
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ILS-${timestamp}-${random}`;
  }

  private calculateShipping(subtotal: number): number {
    if (subtotal >= 75) {
      return 0.0;
    }
    return 5.99;
  }

  private formatOrder(order: any): OrderResponseDTO {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      customerNote: order.customerNote,
      shippingAddressId: order.shippingAddressId,
      shippingAddressSnapshot: order.shippingAddressSnapshot,
      inventoryDeducted: order.inventoryDeducted,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantTitle: item.variantTitle,
        sku: item.sku,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
        selectedRingSize: item.selectedRingSize,
        selectedScent: item.selectedScent,
        customNote: item.customNote,
        imageUrl: item.imageUrl,
      })),
      fulfillments: order.fulfillments || [],
      notes: order.notes || [],
      payments: (order.payments || []).map((p: any) => ({
        id: p.id,
        paymentMethod: p.paymentMethod,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        stripePaymentIntentId: p.stripePaymentIntentId,
        stripeClientSecret: p.stripeClientSecret,
        createdAt: p.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private async resolveAddress(userId: string, data: CheckoutDTO) {
    if (data.shippingAddressId) {
      const address = await prisma.customerAddress.findFirst({
        where: { id: data.shippingAddressId, userId },
      });
      if (address) {
        return {
          addressId: address.id,
          snapshot: {
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        };
      }
    }

    if (data.shippingAddress) {
      const sa = data.shippingAddress;
      const created = await prisma.customerAddress.create({
        data: {
          userId,
          firstName: sa.firstName,
          lastName: sa.lastName,
          phone: sa.phone,
          addressLine1: sa.addressLine1,
          addressLine2: sa.addressLine2 || null,
          city: sa.city,
          state: sa.state,
          postalCode: sa.postalCode,
          country: sa.country || 'US',
        },
      });
      return {
        addressId: created.id,
        snapshot: {
          firstName: created.firstName,
          lastName: created.lastName,
          phone: created.phone,
          addressLine1: created.addressLine1,
          addressLine2: created.addressLine2,
          city: created.city,
          state: created.state,
          postalCode: created.postalCode,
          country: created.country,
        },
      };
    }

    const defaultAddr = await prisma.customerAddress.findFirst({
      where: { userId, isDefault: true },
    });
    if (defaultAddr) {
      return {
        addressId: defaultAddr.id,
        snapshot: {
          firstName: defaultAddr.firstName,
          lastName: defaultAddr.lastName,
          phone: defaultAddr.phone,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2,
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country,
        },
      };
    }

    const error: any = new Error('Shipping address is required');
    error.statusCode = 400;
    throw error;
  }

  private async resolveItems(userId: string, data: CheckoutDTO) {
    if (data.items && data.items.length > 0) {
      return data.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId || null,
        quantity: i.quantity,
        selectedRingSize: i.selectedRingSize || null,
        selectedScent: i.selectedScent || null,
        customNote: i.customNote || null,
      }));
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      const error: any = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    return cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId || null,
      quantity: i.quantity,
      selectedRingSize: i.selectedRingSize || null,
      selectedScent: i.selectedScent || null,
      customNote: i.customNote || null,
    }));
  }

  async createCheckoutOrder(userId: string, data: CheckoutDTO): Promise<OrderResponseDTO> {
    const rawItems = await this.resolveItems(userId, data);
    const { addressId, snapshot } = await this.resolveAddress(userId, data);

    let calculatedSubtotal = 0;
    const preparedItems: any[] = [];

    for (const item of rawItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== ProductStatus.ACTIVE) {
        const error: any = new Error(
          `Product "${product ? product.name : 'Unknown'}" is not available for purchase`
        );
        error.statusCode = 400;
        throw error;
      }

      let unitPrice = Number(product.price);
      let variantTitle: string | null = null;
      let sku: string | null = product.sku;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || !variant.isActive || variant.productId !== product.id) {
          const error: any = new Error(
            `Product variant for "${product.name}" is no longer available`
          );
          error.statusCode = 400;
          throw error;
        }

        if (variant.stock < item.quantity) {
          const error: any = new Error(
            `Insufficient stock for "${product.name} (${variant.title || 'Variant'})". Only ${variant.stock} available.`
          );
          error.statusCode = 400;
          throw error;
        }

        unitPrice = Number(variant.price);
        variantTitle = variant.title;
        if (variant.sku) sku = variant.sku;
      } else {
        if (product.stock < item.quantity) {
          const error: any = new Error(
            `Insufficient stock for "${product.name}". Only ${product.stock} available.`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      preparedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantTitle,
        sku,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        selectedRingSize: item.selectedRingSize || null,
        selectedScent: item.selectedScent || null,
        customNote: item.customNote || null,
        imageUrl: product.imageUrl || null,
      });
    }

    let discountAmount = 0;
    if (data.promoCode) {
      try {
        const couponRes = await couponService.validateCoupon(data.promoCode, calculatedSubtotal, userId);
        discountAmount = couponRes.discountAmount;
      } catch {}
    }

    const shippingFee = this.calculateShipping(calculatedSubtotal);
    const totalAmount = Math.max(0, calculatedSubtotal - discountAmount) + shippingFee;
    const orderNumber = this.generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.STRIPE,
          currency: 'USD',
          subtotal: calculatedSubtotal,
          shippingFee,
          taxAmount: 0,
          discountAmount,
          totalAmount,
          customerNote: data.customerNote || data.notes || null,
          shippingAddressId: addressId,
          shippingAddressSnapshot: snapshot,
          inventoryDeducted: false,
          items: {
            create: preparedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantTitle: item.variantTitle,
              sku: item.sku,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
              selectedRingSize: item.selectedRingSize,
              selectedScent: item.selectedScent,
              customNote: item.customNote,
              imageUrl: item.imageUrl,
            })),
          },
          fulfillments: {
            create: {
              status: FulfillmentStatus.UNFULFILLED,
            },
          },
          payments: {
            create: {
              paymentMethod: PaymentMethod.STRIPE,
              amount: totalAmount,
              currency: 'USD',
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: {
          items: true,
          fulfillments: true,
          payments: true,
        },
      });

      return createdOrder;
    });

    if (data.promoCode && discountAmount > 0) {
      try {
        await couponService.recordCouponUsage(data.promoCode, userId, order.id, discountAmount);
      } catch {}
    }

    return this.formatOrder(order);
  }

  async createCodOrder(userId: string, data: CodCheckoutDTO): Promise<OrderResponseDTO> {
    const rawItems = await this.resolveItems(userId, data);
    const { addressId, snapshot } = await this.resolveAddress(userId, data);

    const order = await prisma.$transaction(async (tx) => {
      let calculatedSubtotal = 0;
      const preparedItems: any[] = [];
      const inventoryUpdates: Array<{
        productId: string;
        variantId: string | null;
        quantity: number;
      }> = [];

      for (const item of rawItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.status !== ProductStatus.ACTIVE) {
          const error: any = new Error(
            `Product "${product ? product.name : 'Unknown'}" is not available for purchase`
          );
          error.statusCode = 400;
          throw error;
        }

        let unitPrice = Number(product.price);
        let variantTitle: string | null = null;
        let sku: string | null = product.sku;

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (!variant || !variant.isActive || variant.productId !== product.id) {
            const error: any = new Error(
              `Product variant for "${product.name}" is no longer available`
            );
            error.statusCode = 400;
            throw error;
          }

          if (variant.stock < item.quantity) {
            const error: any = new Error(
              `Insufficient stock for "${product.name} (${variant.title || 'Variant'})". Only ${variant.stock} available.`
            );
            error.statusCode = 400;
            throw error;
          }

          unitPrice = Number(variant.price);
          variantTitle = variant.title;
          if (variant.sku) sku = variant.sku;

          inventoryUpdates.push({
            productId: product.id,
            variantId: variant.id,
            quantity: item.quantity,
          });
        } else {
          if (product.stock < item.quantity) {
            const error: any = new Error(
              `Insufficient stock for "${product.name}". Only ${product.stock} available.`
            );
            error.statusCode = 400;
            throw error;
          }

          inventoryUpdates.push({
            productId: product.id,
            variantId: null,
            quantity: item.quantity,
          });
        }

        const lineTotal = unitPrice * item.quantity;
        calculatedSubtotal += lineTotal;

        preparedItems.push({
          productId: product.id,
          variantId: item.variantId || null,
          productName: product.name,
          variantTitle,
          sku,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
          selectedRingSize: item.selectedRingSize || null,
          selectedScent: item.selectedScent || null,
          customNote: item.customNote || null,
          imageUrl: product.imageUrl || null,
        });
      }

      let discountAmount = 0;
      if (data.promoCode) {
        try {
          const couponRes = await couponService.validateCoupon(data.promoCode, calculatedSubtotal, userId);
          discountAmount = couponRes.discountAmount;
        } catch {}
      }

      const shippingFee = this.calculateShipping(calculatedSubtotal);
      const totalAmount = Math.max(0, calculatedSubtotal - discountAmount) + shippingFee;
      const orderNumber = this.generateOrderNumber();

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.COD,
          currency: 'USD',
          subtotal: calculatedSubtotal,
          shippingFee,
          taxAmount: 0,
          discountAmount,
          totalAmount,
          customerNote: data.customerNote || data.notes || null,
          shippingAddressId: addressId,
          shippingAddressSnapshot: snapshot,
          inventoryDeducted: true,
          items: {
            create: preparedItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantTitle: item.variantTitle,
              sku: item.sku,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              lineTotal: item.lineTotal,
              selectedRingSize: item.selectedRingSize,
              selectedScent: item.selectedScent,
              customNote: item.customNote,
              imageUrl: item.imageUrl,
            })),
          },
          fulfillments: {
            create: {
              status: FulfillmentStatus.UNFULFILLED,
            },
          },
          payments: {
            create: {
              paymentMethod: PaymentMethod.COD,
              amount: totalAmount,
              currency: 'USD',
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: {
          items: true,
          fulfillments: true,
          payments: true,
        },
      });

      for (const update of inventoryUpdates) {
        if (update.variantId) {
          const v = await tx.productVariant.update({
            where: { id: update.variantId },
            data: {
              stock: { decrement: update.quantity },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: update.productId,
              variantId: update.variantId,
              changeQty: -update.quantity,
              previousQty: v.stock + update.quantity,
              newQty: v.stock,
              reason: 'ORDER_FULFILLMENT',
              createdBy: createdOrder.id,
            },
          });
        } else {
          const p = await tx.product.update({
            where: { id: update.productId },
            data: {
              stock: { decrement: update.quantity },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: update.productId,
              variantId: null,
              changeQty: -update.quantity,
              previousQty: p.stock + update.quantity,
              newQty: p.stock,
              reason: 'ORDER_FULFILLMENT',
              createdBy: createdOrder.id,
            },
          });
        }
      }

      const userCart = await tx.cart.findUnique({
        where: { userId },
      });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      return createdOrder;
    });

    if (data.promoCode && Number(order.discountAmount) > 0) {
      try {
        await couponService.recordCouponUsage(data.promoCode, userId, order.id, Number(order.discountAmount));
      } catch {}
    }

    const repCode = data.attributedRep?.repUsername || data.attributedRep?.name || data.attributedRep;
    if (repCode && typeof repCode === 'string') {
      try {
        await affiliateService.processOrderCommissions(order.id, repCode);
      } catch {}
    }

    try {
      await notificationService.createNotification({
        userId,
        title: `Order Placed - #${order.orderNumber}`,
        message: `Your Cash on Delivery order #${order.orderNumber} for $${Number(order.totalAmount).toFixed(2)} has been placed successfully.`,
        type: 'ORDER',
        actionUrl: `/order-confirmation/${order.id}`,
      });
    } catch {}

    return this.formatOrder(order);
  }

  async getCustomerOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          fulfillments: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders: orders.map((o) => this.formatOrder(o)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerOrderById(userId: string, orderId: string): Promise<OrderResponseDTO> {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        fulfillments: true,
        payments: true,
        notes: {
          where: { isCustomerVisible: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatOrder(order);
  }

  async cancelCustomerOrder(userId: string, orderId: string): Promise<OrderResponseDTO> {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        payments: true,
        fulfillments: true,
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      const error: any = new Error(
        `Order cannot be cancelled in its current status (${order.status})`
      );
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      if (order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.variantId) {
            const v = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId || '',
                variantId: item.variantId,
                changeQty: item.quantity,
                previousQty: v.stock - item.quantity,
                newQty: v.stock,
                reason: 'ORDER_CANCELLATION',
                createdBy: order.id,
              },
            });
          } else if (item.productId) {
            const p = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: null,
                changeQty: item.quantity,
                previousQty: p.stock - item.quantity,
                newQty: p.stock,
                reason: 'ORDER_CANCELLATION',
                createdBy: order.id,
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          inventoryDeducted: false,
          notes: {
            create: {
              authorRole: 'CUSTOMER',
              authorId: userId,
              note: 'Order cancelled by customer',
              isCustomerVisible: true,
            },
          },
        },
        include: {
          items: true,
          fulfillments: true,
          payments: true,
          notes: true,
        },
      });

      return this.formatOrder(updated);
    });
  }

  async getAdminOrders(query: ListOrdersQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: true,
          fulfillments: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => ({
        ...this.formatOrder(o),
        customer: o.user,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        items: true,
        fulfillments: true,
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        refunds: true,
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...this.formatOrder(order),
      customer: order.user,
      refunds: order.refunds,
    };
  }

  async updateOrderStatusByAdmin(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    authorId?: string
  ): Promise<OrderResponseDTO> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        fulfillments: true,
        payments: true,
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      // If cancelling order and inventory was deducted, restore it
      if (newStatus === OrderStatus.CANCELLED && order.inventoryDeducted) {
        for (const item of order.items) {
          if (item.variantId) {
            const v = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId || '',
                variantId: item.variantId,
                changeQty: item.quantity,
                previousQty: v.stock - item.quantity,
                newQty: v.stock,
                reason: 'ORDER_CANCELLATION',
                createdBy: orderId,
              },
            });
          } else if (item.productId) {
            const p = await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: null,
                changeQty: item.quantity,
                previousQty: p.stock - item.quantity,
                newQty: p.stock,
                reason: 'ORDER_CANCELLATION',
                createdBy: orderId,
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          ...(newStatus === OrderStatus.CANCELLED && { inventoryDeducted: false }),
          ...(note && {
            notes: {
              create: {
                authorRole: 'ADMIN',
                authorId: authorId || null,
                note: `Status updated to ${newStatus}. Note: ${note}`,
                isCustomerVisible: true,
              },
            },
          }),
        },
        include: {
          items: true,
          fulfillments: true,
          payments: true,
          notes: true,
        },
      });

      return this.formatOrder(updated);
    });
  }

  async updateFulfillmentByAdmin(
    orderId: string,
    data: UpdateFulfillmentDTO
  ): Promise<OrderResponseDTO> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        fulfillments: true,
      },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    const existingFulfillment = order.fulfillments[0];

    const isDelivered = data.status === FulfillmentStatus.DELIVERED;
    const isShipped = data.status === FulfillmentStatus.SHIPPED;

    await prisma.$transaction(async (tx) => {
      if (existingFulfillment) {
        await tx.orderFulfillment.update({
          where: { id: existingFulfillment.id },
          data: {
            status: data.status,
            trackingCompany: data.trackingCompany !== undefined ? data.trackingCompany : existingFulfillment.trackingCompany,
            trackingNumber: data.trackingNumber !== undefined ? data.trackingNumber : existingFulfillment.trackingNumber,
            trackingUrl: data.trackingUrl !== undefined ? data.trackingUrl : existingFulfillment.trackingUrl,
            notes: data.notes !== undefined ? data.notes : existingFulfillment.notes,
            ...(isShipped && !existingFulfillment.shippedAt && { shippedAt: new Date() }),
            ...(isDelivered && !existingFulfillment.deliveredAt && { deliveredAt: new Date() }),
          },
        });
      } else {
        await tx.orderFulfillment.create({
          data: {
            orderId,
            status: data.status,
            trackingCompany: data.trackingCompany || null,
            trackingNumber: data.trackingNumber || null,
            trackingUrl: data.trackingUrl || null,
            notes: data.notes || null,
            ...(isShipped && { shippedAt: new Date() }),
            ...(isDelivered && { deliveredAt: new Date() }),
          },
        });
      }

      if (isDelivered) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.DELIVERED },
        });
      } else if (isShipped && order.status !== OrderStatus.DELIVERED) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.SHIPPED },
        });
      }
    });

    const refreshed = await this.getAdminOrderById(orderId);
    return refreshed;
  }

  async addOrderNoteByAdmin(
    orderId: string,
    note: string,
    isCustomerVisible: boolean,
    authorId: string,
    authorRole: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      const error: any = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    const createdNote = await prisma.orderNote.create({
      data: {
        orderId,
        authorId,
        authorRole,
        note,
        isCustomerVisible,
      },
    });

    return createdNote;
  }
}

export const ordersService = new OrdersService();
