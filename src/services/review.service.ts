import { prisma } from '../lib/prisma';
import { ProductReviewDTO, ProductRatingSummaryDTO } from '../types/review.types';

export class ReviewService {
  private async recalculateProductRating(productId: string): Promise<void> {
    const reviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const count = reviews.length;
    const avg = count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avg,
        reviewCount: count,
      },
    });
  }

  async getProductReviews(
    productId: string,
    query: { page?: number; limit?: number }
  ): Promise<{ reviews: ProductReviewDTO[]; summary: ProductRatingSummaryDTO; total: number }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const [allReviews, reviewsPage] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId, isApproved: true },
        select: { rating: true },
      }),
      prisma.productReview.findMany({
        where: { productId, isApproved: true },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    allReviews.forEach((r) => {
      const rate = r.rating as 1 | 2 | 3 | 4 | 5;
      if (breakdown[rate] !== undefined) breakdown[rate]++;
      sum += r.rating;
    });

    const total = allReviews.length;
    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
      reviews: reviewsPage.map((r) => ({
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        userName: `${r.user.firstName || ''} ${r.user.lastName ? r.user.lastName[0] + '.' : ''}`.trim() || 'Verified Customer',
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      summary: {
        averageRating,
        reviewCount: total,
        ratingBreakdown: breakdown,
      },
      total,
    };
  }

  async createReview(
    userId: string,
    data: { productId: string; rating: number; title?: string; comment: string }
  ): Promise<ProductReviewDTO> {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      const err: any = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    // Check if user already reviewed
    const existing = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId,
        },
      },
    });

    if (existing) {
      const err: any = new Error('You have already submitted a review for this product');
      err.statusCode = 400;
      throw err;
    }

    // Check verified purchase
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        paymentStatus: 'PAID',
        items: { some: { productId: data.productId } },
      },
    });

    const isVerifiedPurchase = Boolean(orderWithProduct);

    const review = await prisma.productReview.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        isVerifiedPurchase,
        isApproved: true,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    await this.recalculateProductRating(data.productId);

    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Verified Customer',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  async updateReview(
    id: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string }
  ): Promise<ProductReviewDTO> {
    const review = await prisma.productReview.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!review) {
      const err: any = new Error('Review not found');
      err.statusCode = 404;
      throw err;
    }

    if (review.userId !== userId) {
      const err: any = new Error('You can only update your own review');
      err.statusCode = 403;
      throw err;
    }

    const updated = await prisma.productReview.update({
      where: { id },
      data: {
        rating: data.rating !== undefined ? data.rating : review.rating,
        title: data.title !== undefined ? data.title : review.title,
        comment: data.comment !== undefined ? data.comment : review.comment,
      },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    await this.recalculateProductRating(updated.productId);

    return {
      id: updated.id,
      productId: updated.productId,
      userId: updated.userId,
      userName: `${updated.user.firstName || ''} ${updated.user.lastName || ''}`.trim() || 'Verified Customer',
      rating: updated.rating,
      title: updated.title,
      comment: updated.comment,
      isVerifiedPurchase: updated.isVerifiedPurchase,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteReview(id: string, userId: string, isAdmin = false): Promise<void> {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) {
      const err: any = new Error('Review not found');
      err.statusCode = 404;
      throw err;
    }

    if (!isAdmin && review.userId !== userId) {
      const err: any = new Error('You can only delete your own review');
      err.statusCode = 403;
      throw err;
    }

    const productId = review.productId;
    await prisma.productReview.delete({ where: { id } });
    await this.recalculateProductRating(productId);
  }
}

export const reviewService = new ReviewService();
