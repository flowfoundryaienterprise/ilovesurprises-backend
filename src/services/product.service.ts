import { prisma } from '../lib/prisma';
import { generateSlug } from '../utils/slug';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductListQueryDTO,
  FormattedProductDTO,
} from '../types/product.types';
import { Prisma, ProductStatus } from '@prisma/client';

export class ProductsService {
  formatProduct(p: any): FormattedProductDTO {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice !== null && p.compareAtPrice !== undefined ? Number(p.compareAtPrice) : null,
      imageUrl: p.imageUrl || (p.images && p.images.length > 0 ? p.images[0].url : null),
      categoryId: p.categoryId,
      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          }
        : null,
      collections: p.collections
        ? p.collections.map((c: any) => ({
            id: c.collection ? c.collection.id : c.collectionId,
            name: c.collection ? c.collection.name : '',
            slug: c.collection ? c.collection.slug : '',
          }))
        : [],
      surpriseType: p.surpriseType,
      surpriseValue: p.surpriseValue !== null && p.surpriseValue !== undefined ? Number(p.surpriseValue) : null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      sku: p.sku,
      badge: p.badge,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew,
      scentNotes: p.scentNotes || [],
      ringSizes: p.ringSizes || [],
      jewelryTypes: p.jewelryTypes || [],
      status: p.status,
      images: p.images
        ? p.images.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          }))
        : [],
      options: p.options
        ? p.options.map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            values: opt.values
              ? opt.values.map((v: any) => ({
                  id: v.id,
                  value: v.value,
                  sortOrder: v.sortOrder,
                }))
              : [],
          }))
        : [],
      variants: p.variants
        ? p.variants.map((v: any) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice !== null && v.compareAtPrice !== undefined ? Number(v.compareAtPrice) : null,
            stock: v.stock,
            ringSize: v.ringSize,
            scent: v.scent,
            isActive: v.isActive,
          }))
        : [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async listProducts(query: ProductListQueryDTO, isPublic = true): Promise<{
    products: FormattedProductDTO[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.ProductWhereInput[] = [];

    // For public requests, only ACTIVE products are visible
    if (isPublic) {
      andConditions.push({ status: ProductStatus.ACTIVE });
    } else if (query.status) {
      andConditions.push({ status: query.status });
    }

    if (query.search) {
      const q = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { surpriseType: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Category or Collection filtering
    // In imported catalog, hierarchy uses collections (products.categoryId is NULL)
    const targetCollection = query.collection || query.category;
    if (targetCollection && targetCollection !== 'all' && targetCollection !== 'All Surprises') {
      const term = targetCollection.trim();
      andConditions.push({
        OR: [
          {
            collections: {
              some: {
                collection: {
                  OR: [
                    { id: term },
                    { slug: { equals: term, mode: 'insensitive' } },
                    { slug: { startsWith: term, mode: 'insensitive' } },
                    { name: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
          {
            category: {
              OR: [
                { id: term },
                { slug: { equals: term, mode: 'insensitive' } },
                { slug: { startsWith: term, mode: 'insensitive' } },
                { name: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    if (query.surpriseType) {
      const st = query.surpriseType.toLowerCase().trim();
      if (st === 'jewelry' || st === 'jewellery') {
        andConditions.push({
          OR: [
            { surpriseType: { contains: 'ring', mode: 'insensitive' } },
            { surpriseType: { contains: 'jewel', mode: 'insensitive' } },
            { surpriseType: { contains: 'pendant', mode: 'insensitive' } },
            { surpriseType: { contains: 'necklace', mode: 'insensitive' } },
            { surpriseType: { contains: 'bracelet', mode: 'insensitive' } },
            { surpriseType: { contains: 'earring', mode: 'insensitive' } },
            { surpriseType: { contains: 'diamond', mode: 'insensitive' } },
          ],
        });
      } else if (st === 'cash' || st === 'money') {
        andConditions.push({
          OR: [
            { surpriseType: { contains: 'cash', mode: 'insensitive' } },
            { surpriseType: { contains: 'money', mode: 'insensitive' } },
          ],
        });
      } else {
        andConditions.push({
          surpriseType: { contains: query.surpriseType, mode: 'insensitive' },
        });
      }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {};
      if (query.minPrice !== undefined) priceFilter.gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.lte = query.maxPrice;
      andConditions.push({ price: priceFilter });
    }

    if (query.rating !== undefined) {
      andConditions.push({ rating: { gte: query.rating } });
    }

    if (query.inStock !== undefined) {
      if (query.inStock) {
        andConditions.push({ stock: { gt: 0 } });
      } else {
        andConditions.push({ stock: { equals: 0 } });
      }
    }

    if (query.isBestSeller !== undefined) {
      andConditions.push({ isBestSeller: query.isBestSeller });
    }

    if (query.isNew !== undefined) {
      andConditions.push({ isNew: query.isNew });
    }

    const where: Prisma.ProductWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Determine order by with deterministic tie-breaker
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isBestSeller: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];

    switch (query.sort) {
      case 'best_sellers':
      case 'bestselling':
        orderBy = [{ isBestSeller: 'desc' }, { reviewCount: 'desc' }, { rating: 'desc' }, { id: 'asc' }];
        break;
      case 'price_asc':
      case 'price-low-to-high':
        orderBy = [{ price: 'asc' }, { id: 'asc' }];
        break;
      case 'price_desc':
      case 'price-high-to-low':
        orderBy = [{ price: 'desc' }, { id: 'asc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }, { id: 'asc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
        break;
      case 'featured':
      default:
        orderBy = [{ isBestSeller: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];
        break;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          collections: {
            include: { collection: { select: { id: true, name: true, slug: true } } },
          },
          images: { orderBy: { sortOrder: 'asc' } },
          options: {
            include: { values: { orderBy: { sortOrder: 'asc' } } },
          },
          variants: isPublic ? { where: { isActive: true } } : true,
        },
      }),
    ]);

    return {
      products: products.map((p) => this.formatProduct(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlug(slug: string, isPublic = true): Promise<FormattedProductDTO> {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collections: {
          include: { collection: { select: { id: true, name: true, slug: true } } },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        options: {
          include: { values: { orderBy: { sortOrder: 'asc' } } },
        },
        variants: isPublic ? { where: { isActive: true } } : true,
      },
    });

    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (isPublic && product.status !== ProductStatus.ACTIVE) {
      const error: any = new Error('Product not found or currently unavailable');
      error.statusCode = 404;
      throw error;
    }

    return this.formatProduct(product);
  }

  async getProductById(id: string): Promise<FormattedProductDTO> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collections: {
          include: { collection: { select: { id: true, name: true, slug: true } } },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        options: {
          include: { values: { orderBy: { sortOrder: 'asc' } } },
        },
        variants: true,
      },
    });

    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatProduct(product);
  }

  async createProduct(data: CreateProductDTO): Promise<FormattedProductDTO> {
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!slug) slug = `product-${Date.now()}`;

    // Ensure unique slug
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Check SKU uniqueness if provided
    if (data.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku.trim() } });
      if (existingSku) {
        const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    // Check category if provided
    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) {
        const error: any = new Error('Specified category does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    // Determine primary image
    const primaryImg = data.images?.find((img) => img.isPrimary) || data.images?.[0];
    const imageUrl = data.imageUrl || primaryImg?.url || null;

    // Use Prisma transaction to create product and all relational structures cleanly
    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name.trim(),
          slug,
          shortDescription: data.shortDescription?.trim() || null,
          description: data.description?.trim() || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          imageUrl,
          categoryId: data.categoryId || null,
          surpriseType: data.surpriseType?.trim() || null,
          surpriseValue: data.surpriseValue ?? null,
          stock: data.stock ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          sku: data.sku?.trim() || null,
          badge: data.badge?.trim() || null,
          isBestSeller: data.isBestSeller ?? false,
          isNew: data.isNew ?? false,
          scentNotes: data.scentNotes || [],
          ringSizes: data.ringSizes || [],
          jewelryTypes: data.jewelryTypes || [],
          status: data.status || ProductStatus.DRAFT,
          // Images
          images: data.images && data.images.length > 0
            ? {
                create: data.images.map((img, idx) => ({
                  url: img.url,
                  altText: img.altText || null,
                  sortOrder: img.sortOrder ?? idx,
                  isPrimary: img.isPrimary ?? idx === 0,
                })),
              }
            : undefined,
          // Collections
          collections: data.collectionIds && data.collectionIds.length > 0
            ? {
                create: data.collectionIds.map((colId, idx) => ({
                  collectionId: colId,
                  sortOrder: idx,
                })),
              }
            : undefined,
        },
      });

      // Options & Option Values
      if (data.options && data.options.length > 0) {
        for (const opt of data.options) {
          const optValues = opt.values || [];
          await tx.productOption.create({
            data: {
              productId: product.id,
              name: opt.name.trim(),
              values: optValues.length > 0
                ? {
                    create: optValues.map((v, vIdx) => ({
                      value: v.value.trim(),
                      sortOrder: v.sortOrder ?? vIdx,
                    })),
                  }
                : undefined,
            },
          });
        }
      }

      // Variants
      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              title: v.title?.trim() || null,
              sku: v.sku?.trim() || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock ?? 0,
              ringSize: v.ringSize?.trim() || null,
              scent: v.scent?.trim() || null,
              isActive: v.isActive !== undefined ? v.isActive : true,
            },
          });
        }
      }

      // Initial Inventory Log
      if ((data.stock ?? 0) > 0) {
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            changeQty: data.stock ?? 0,
            previousQty: 0,
            newQty: data.stock ?? 0,
            reason: 'INITIAL',
          },
        });
      }

      return product;
    });

    return this.getProductById(createdProduct.id);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<FormattedProductDTO> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        options: { include: { values: true } },
        variants: true,
        collections: true,
      },
    });

    if (!existing) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = generateSlug(data.slug);
      const duplicate = await prisma.product.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        const error: any = new Error('Product with this slug already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({ where: { sku: data.sku.trim() } });
      if (duplicateSku && duplicateSku.id !== id) {
        const error: any = new Error(`Product with SKU '${data.sku}' already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) {
        const error: any = new Error('Specified category does not exist');
        error.statusCode = 400;
        throw error;
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Core Product
      await tx.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name.trim() }),
          ...(data.slug !== undefined && { slug }),
          ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription?.trim() || null }),
          ...(data.description !== undefined && { description: data.description?.trim() || null }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
          ...(data.surpriseType !== undefined && { surpriseType: data.surpriseType?.trim() || null }),
          ...(data.surpriseValue !== undefined && { surpriseValue: data.surpriseValue }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
          ...(data.sku !== undefined && { sku: data.sku?.trim() || null }),
          ...(data.badge !== undefined && { badge: data.badge?.trim() || null }),
          ...(data.isBestSeller !== undefined && { isBestSeller: data.isBestSeller }),
          ...(data.isNew !== undefined && { isNew: data.isNew }),
          ...(data.scentNotes !== undefined && { scentNotes: data.scentNotes }),
          ...(data.ringSizes !== undefined && { ringSizes: data.ringSizes }),
          ...(data.jewelryTypes !== undefined && { jewelryTypes: data.jewelryTypes }),
          ...(data.status !== undefined && { status: data.status }),
        },
      });

      // 2. Inventory Log if stock adjusted
      if (data.stock !== undefined && data.stock !== existing.stock) {
        await tx.inventoryLog.create({
          data: {
            productId: id,
            changeQty: data.stock - existing.stock,
            previousQty: existing.stock,
            newQty: data.stock,
            reason: 'MANUAL_ADJUSTMENT',
          },
        });
      }

      // 3. Update Collections if provided
      if (data.collectionIds !== undefined) {
        await tx.productCollection.deleteMany({ where: { productId: id } });
        if (data.collectionIds.length > 0) {
          await tx.productCollection.createMany({
            data: data.collectionIds.map((colId, idx) => ({
              productId: id,
              collectionId: colId,
              sortOrder: idx,
            })),
          });
        }
      }

      // 4. Update Images if provided
      if (data.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        const imagesList = data.images || [];
        if (imagesList.length > 0) {
          await tx.productImage.createMany({
            data: imagesList.map((img, idx) => ({
              productId: id,
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            })),
          });
        }
      }

      // 5. Update Options if provided
      if (data.options !== undefined) {
        await tx.productOptionValue.deleteMany({ where: { option: { productId: id } } });
        await tx.productOption.deleteMany({ where: { productId: id } });
        const optionsList = data.options || [];
        for (const opt of optionsList) {
          const optValues = opt.values || [];
          await tx.productOption.create({
            data: {
              productId: id,
              name: opt.name.trim(),
              values: optValues.length > 0
                ? {
                    create: optValues.map((v, vIdx) => ({
                      value: v.value.trim(),
                      sortOrder: v.sortOrder ?? vIdx,
                    })),
                  }
                : undefined,
            },
          });
        }
      }

      // 6. Update Variants if provided
      if (data.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              title: v.title?.trim() || null,
              sku: v.sku?.trim() || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock ?? 0,
              ringSize: v.ringSize?.trim() || null,
              scent: v.scent?.trim() || null,
              isActive: v.isActive !== undefined ? v.isActive : true,
            },
          });
        }
      }
    });

    return this.getProductById(id);
  }

  async updateProductStatus(id: string, status: ProductStatus): Promise<FormattedProductDTO> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.product.update({
      where: { id },
      data: { status },
    });

    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { cartItems: true },
    });

    if (!existing) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Clean up cart items if any reference this product
    if (existing.cartItems && existing.cartItems.length > 0) {
      await prisma.cartItem.deleteMany({ where: { productId: id } });
    }

    await prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }
}

export const productsService = new ProductsService();
