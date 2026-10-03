import { prisma } from '../lib/prisma';
import {
  AddToCartDTO,
  CartResponseDTO,
  CartItemResponseDTO,
  CartValidationResponseDTO,
  CartValidationItemDTO,
} from '../types/cart.types';
import { ProductStatus } from '@prisma/client';

export class CartService {
  private async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDTO> {
    const cart = await this.getOrCreateCart(userId);

    let subtotal = 0;
    let totalQuantity = 0;
    let unavailableCount = 0;

    const formattedItems: CartItemResponseDTO[] = cart.items.map((item) => {
      const p = item.product;
      const v = item.variant;

      // Determine unit price server-side from live DB records
      const unitPrice = v ? Number(v.price) : Number(p.price);
      const lineSubtotal = Math.round(unitPrice * item.quantity * 100) / 100;

      // Determine stock and availability
      const availableStock = v ? v.stock : p.stock;
      const isProductActive = p.status === ProductStatus.ACTIVE && (v ? v.isActive : true);
      const hasStock = availableStock >= item.quantity;
      const isAvailable = isProductActive && hasStock;

      let unavailableReason: string | undefined;
      if (!isProductActive) {
        unavailableReason = 'Product is no longer active or available';
      } else if (!hasStock) {
        unavailableReason = `Only ${availableStock} item(s) left in stock`;
      }

      if (!isAvailable) {
        unavailableCount++;
      }

      subtotal += lineSubtotal;
      totalQuantity += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: p.name,
        productSlug: p.slug,
        productImageUrl: p.imageUrl,
        productPrice: Number(p.price),
        productCompareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        productStock: p.stock,
        isProductActive,

        variantId: item.variantId,
        variantTitle: v ? v.title : null,
        variantPrice: v ? Number(v.price) : null,
        variantStock: v ? v.stock : null,

        quantity: item.quantity,
        selectedRingSize: item.selectedRingSize,
        selectedScent: item.selectedScent,
        customNote: item.customNote,

        unitPrice,
        lineSubtotal,
        isAvailable,
        unavailableReason,
      };
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items: formattedItems,
      totalQuantity,
      itemCount: formattedItems.length,
      subtotal: Math.round(subtotal * 100) / 100,
      isAvailable: unavailableCount === 0,
      unavailableCount,
      updatedAt: cart.updatedAt,
    };
  }

  async addItem(userId: string, data: AddToCartDTO): Promise<CartResponseDTO> {
    const qty = data.quantity && data.quantity > 0 ? data.quantity : 1;

    // 1. Verify product exists in database and is ACTIVE
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { variants: true },
    });

    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.status !== ProductStatus.ACTIVE) {
      const error: any = new Error('Product is currently inactive and cannot be added to cart');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify variant if provided
    let variant = null;
    if (data.variantId) {
      variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId },
      });

      if (!variant || variant.productId !== product.id) {
        const error: any = new Error('Specified product variant does not exist for this product');
        error.statusCode = 400;
        throw error;
      }

      if (!variant.isActive) {
        const error: any = new Error('Selected product variant is inactive');
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Check stock server-side
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < qty) {
      const error: any = new Error(
        `Insufficient stock available. Only ${availableStock} item(s) in stock.`
      );
      error.statusCode = 400;
      throw error;
    }

    // 4. Retrieve or create user's cart
    const cart = await this.getOrCreateCart(userId);

    // 5. Check for duplicate cart item with identical options
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: variant ? variant.id : null,
        selectedRingSize: data.selectedRingSize || null,
        selectedScent: data.selectedScent || null,
      },
    });

    if (existingItem) {
      const newTotalQty = existingItem.quantity + qty;
      if (availableStock < newTotalQty) {
        const error: any = new Error(
          `Cannot add more. You have ${existingItem.quantity} in cart and only ${availableStock} available.`
        );
        error.statusCode = 400;
        throw error;
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newTotalQty,
          customNote: data.customNote || existingItem.customNote,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant ? variant.id : null,
          quantity: qty,
          selectedRingSize: data.selectedRingSize || null,
          selectedScent: data.selectedScent || null,
          customNote: data.customNote || null,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartResponseDTO> {
    if (quantity < 1) {
      const error: any = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }

    const cart = await this.getOrCreateCart(userId);

    // Security check: item must belong to this customer's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) {
      const error: any = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }

    // Check stock
    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (availableStock < quantity) {
      const error: any = new Error(
        `Insufficient stock available. Only ${availableStock} item(s) in stock.`
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartResponseDTO> {
    const cart = await this.getOrCreateCart(userId);

    // Security check: ensure item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      const error: any = new Error('Cart item not found in your cart');
      error.statusCode = 404;
      throw error;
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<{ message: string; cart: CartResponseDTO }> {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const refreshedCart = await this.getCart(userId);
    return {
      message: 'Cart cleared successfully',
      cart: refreshedCart,
    };
  }

  async validateCart(userId: string): Promise<CartValidationResponseDTO> {
    const cart = await this.getCart(userId);
    const issues: CartValidationItemDTO[] = [];

    for (const item of cart.items) {
      const liveProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!liveProduct || liveProduct.status !== ProductStatus.ACTIVE) {
        issues.push({
          cartItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          requestedQuantity: item.quantity,
          availableStock: 0,
          unitPrice: item.unitPrice,
          isValid: false,
          message: 'Product is no longer available',
        });
        continue;
      }

      let availableStock = liveProduct.stock;
      if (item.variantId) {
        const liveVariant = liveProduct.variants.find((v) => v.id === item.variantId);
        if (!liveVariant || !liveVariant.isActive) {
          issues.push({
            cartItemId: item.id,
            productId: item.productId,
            productName: item.productName,
            requestedQuantity: item.quantity,
            availableStock: 0,
            unitPrice: item.unitPrice,
            isValid: false,
            message: 'Selected variant is no longer available',
          });
          continue;
        }
        availableStock = liveVariant.stock;
      }

      if (availableStock < item.quantity) {
        issues.push({
          cartItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          requestedQuantity: item.quantity,
          availableStock,
          unitPrice: item.unitPrice,
          isValid: false,
          message: `Insufficient stock: only ${availableStock} available`,
        });
      }
    }

    return {
      isValid: issues.length === 0,
      cart,
      issues,
    };
  }
}

export const cartService = new CartService();
