import { prisma } from '../lib/prisma';
import { WishlistItemDTO } from '../types/wishlist.types';

export class WishlistService {
  async getWishlist(userId: string): Promise<WishlistItemDTO[]> {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            imageUrl: true,
            rating: true,
            reviewCount: true,
            stock: true,
            badge: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
        imageUrl: item.product.imageUrl,
        rating: item.product.rating,
        reviewCount: item.product.reviewCount,
        stock: item.product.stock,
        badge: item.product.badge,
      },
      createdAt: item.createdAt,
    }));
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItemDTO> {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            imageUrl: true,
            rating: true,
            reviewCount: true,
            stock: true,
            badge: true,
          },
        },
      },
    });

    return {
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
        imageUrl: item.product.imageUrl,
        rating: item.product.rating,
        reviewCount: item.product.reviewCount,
        stock: item.product.stock,
        badge: item.product.badge,
      },
      createdAt: item.createdAt,
    };
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }
}

export const wishlistService = new WishlistService();
