import { prisma } from '../lib/prisma';
import { getProductByIdOrSlug } from './product.service';
import {
  CartSummaryDTO,
  CartItemDTO,
  AddToCartDTO,
  UpdateCartItemDTO,
} from '../types/cart.types';

// Module-level closure state for guest carts
const guestCarts = new Map<string, CartItemDTO[]>();

export const calculateCartSummary = (
  cartId: string,
  userId: string | null,
  items: CartItemDTO[]
): CartSummaryDTO => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const freeShippingThreshold = 50.0;
  const freeShippingEligible = subtotal >= freeShippingThreshold;
  const shipping = subtotal === 0 ? 0 : freeShippingEligible ? 0 : 5.99;
  const discount = 0;
  const total = Math.round((subtotal + shipping - discount) * 100) / 100;
  const amountNeededForFreeShipping = Math.max(
    0,
    Math.round((freeShippingThreshold - subtotal) * 100) / 100
  );

  return {
    id: cartId,
    userId,
    items,
    itemCount,
    subtotal,
    shipping,
    discount,
    total,
    freeShippingEligible,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    updatedAt: new Date(),
  };
};

export const getCart = async (userId?: string, guestCartId?: string): Promise<CartSummaryDTO> => {
  if (userId) {
    try {
      let dbCart = await prisma.carts.findUnique({
        where: { userId },
        include: {
          cart_items: {
            include: {
              products: true,
              product_variants: true,
            },
          },
        },
      });

      if (!dbCart) {
        dbCart = await prisma.carts.create({
          data: {
            id: `cart-${userId}`,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            cart_items: {
              include: {
                products: true,
                product_variants: true,
              },
            },
          },
        });
      }

      const items: CartItemDTO[] = dbCart.cart_items.map((ci) => {
        const unitPrice = ci.product_variants?.price
          ? Number(ci.product_variants.price)
          : Number(ci.products.price);
        return {
          id: ci.id,
          cartId: ci.cartId,
          productId: ci.productId,
          variantId: ci.variantId,
          productName: ci.products.name,
          productSlug: ci.products.slug,
          imageUrl: ci.products.imageUrl,
          unitPrice,
          quantity: ci.quantity,
          lineTotal: Math.round(unitPrice * ci.quantity * 100) / 100,
          selectedRingSize: ci.selectedRingSize,
          selectedScent: ci.selectedScent,
          customNote: ci.customNote,
          createdAt: ci.createdAt,
          updatedAt: ci.updatedAt,
        };
      });

      return calculateCartSummary(dbCart.id, userId, items);
    } catch (err: any) {
      console.warn('DB cart query failed, falling back to session cart:', err.message);
    }
  }

  const cartId = guestCartId || 'guest-session';
  const items = guestCarts.get(cartId) || [];
  return calculateCartSummary(cartId, null, items);
};

export const addToCart = async (
  item: AddToCartDTO,
  userId?: string,
  guestCartId?: string
): Promise<CartSummaryDTO> => {
  const product = await getProductByIdOrSlug(item.productId);
  const quantity = Math.max(1, item.quantity || 1);
  const unitPrice = product.price;

  if (userId) {
    try {
      let dbCart = await prisma.carts.findUnique({ where: { userId } });
      if (!dbCart) {
        dbCart = await prisma.carts.create({
          data: {
            id: `cart-${userId}`,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      const existingItem = await prisma.cart_items.findFirst({
        where: {
          cartId: dbCart.id,
          productId: product.id,
          selectedRingSize: item.selectedRingSize || null,
          selectedScent: item.selectedScent || null,
        },
      });

      if (existingItem) {
        await prisma.cart_items.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.cart_items.create({
          data: {
            id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            cartId: dbCart.id,
            productId: product.id,
            variantId: item.variantId || null,
            quantity,
            selectedRingSize: item.selectedRingSize || null,
            selectedScent: item.selectedScent || null,
            customNote: item.customNote || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      return getCart(userId);
    } catch (err: any) {
      console.warn('DB addToCart failed, using guest storage fallback:', err.message);
    }
  }

  const cartId = guestCartId || 'guest-session';
  const items = guestCarts.get(cartId) || [];

  const existingIndex = items.findIndex(
    (i) =>
      i.productId === product.id &&
      i.selectedRingSize === (item.selectedRingSize || null) &&
      i.selectedScent === (item.selectedScent || null)
  );

  if (existingIndex > -1) {
    items[existingIndex].quantity += quantity;
    items[existingIndex].lineTotal =
      Math.round(items[existingIndex].unitPrice * items[existingIndex].quantity * 100) / 100;
    items[existingIndex].updatedAt = new Date();
  } else {
    const newItem: CartItemDTO = {
      id: `guest-ci-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      cartId,
      productId: product.id,
      variantId: item.variantId || null,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity,
      lineTotal: Math.round(unitPrice * quantity * 100) / 100,
      selectedRingSize: item.selectedRingSize || null,
      selectedScent: item.selectedScent || null,
      customNote: item.customNote || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(newItem);
  }

  guestCarts.set(cartId, items);
  return calculateCartSummary(cartId, null, items);
};

export const updateCartItem = async (
  itemId: string,
  data: UpdateCartItemDTO,
  userId?: string,
  guestCartId?: string
): Promise<CartSummaryDTO> => {
  if (userId) {
    try {
      if (data.quantity !== undefined && data.quantity <= 0) {
        await prisma.cart_items.delete({ where: { id: itemId } });
      } else {
        await prisma.cart_items.update({
          where: { id: itemId },
          data: {
            ...(data.quantity !== undefined && { quantity: data.quantity }),
            ...(data.selectedRingSize !== undefined && { selectedRingSize: data.selectedRingSize }),
            ...(data.selectedScent !== undefined && { selectedScent: data.selectedScent }),
            ...(data.customNote !== undefined && { customNote: data.customNote }),
            updatedAt: new Date(),
          },
        });
      }
      return getCart(userId);
    } catch (err: any) {
      console.warn('DB updateCartItem failed, falling back to guest cart:', err.message);
    }
  }

  const cartId = guestCartId || 'guest-session';
  let items = guestCarts.get(cartId) || [];

  if (data.quantity !== undefined && data.quantity <= 0) {
    items = items.filter((i) => i.id !== itemId);
  } else {
    items = items.map((i) => {
      if (i.id !== itemId) return i;
      const newQty = data.quantity !== undefined ? data.quantity : i.quantity;
      return {
        ...i,
        quantity: newQty,
        lineTotal: Math.round(i.unitPrice * newQty * 100) / 100,
        selectedRingSize: data.selectedRingSize !== undefined ? data.selectedRingSize : i.selectedRingSize,
        selectedScent: data.selectedScent !== undefined ? data.selectedScent : i.selectedScent,
        customNote: data.customNote !== undefined ? data.customNote : i.customNote,
        updatedAt: new Date(),
      };
    });
  }

  guestCarts.set(cartId, items);
  return calculateCartSummary(cartId, null, items);
};

export const removeCartItem = async (
  itemId: string,
  userId?: string,
  guestCartId?: string
): Promise<CartSummaryDTO> => {
  if (userId) {
    try {
      await prisma.cart_items.delete({ where: { id: itemId } });
      return getCart(userId);
    } catch (err: any) {
      console.warn('DB removeCartItem failed, trying memory:', err.message);
    }
  }

  const cartId = guestCartId || 'guest-session';
  const items = (guestCarts.get(cartId) || []).filter((i) => i.id !== itemId);
  guestCarts.set(cartId, items);
  return calculateCartSummary(cartId, null, items);
};

export const clearCart = async (userId?: string, guestCartId?: string): Promise<CartSummaryDTO> => {
  if (userId) {
    try {
      const dbCart = await prisma.carts.findUnique({ where: { userId } });
      if (dbCart) {
        await prisma.cart_items.deleteMany({ where: { cartId: dbCart.id } });
      }
      return getCart(userId);
    } catch (err: any) {
      console.warn('DB clearCart failed, using guest clear:', err.message);
    }
  }

  const cartId = guestCartId || 'guest-session';
  guestCarts.set(cartId, []);
  return calculateCartSummary(cartId, null, []);
};

// Backward compatibility object export
export const cartService = {
  calculateSummary: calculateCartSummary,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
