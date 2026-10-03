import { prisma } from '../lib/prisma';
import { generateSlug } from '../utils/slug';
import { CreateCollectionDTO, UpdateCollectionDTO, CollectionResponseDTO } from '../types/collection.types';

export class CollectionsService {
  private formatCollection(col: any): CollectionResponseDTO {
    return {
      id: col.id,
      name: col.name,
      slug: col.slug,
      description: col.description,
      bannerImage: col.bannerImage,
      isActive: col.isActive,
      sortOrder: col.sortOrder,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
      _count: col._count,
    };
  }

  async listCollections(includeInactive = false): Promise<CollectionResponseDTO[]> {
    const collections = await prisma.collection.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return collections.map((c) => this.formatCollection(c));
  }

  async getCollectionBySlug(slug: string): Promise<any> {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { where: { isActive: true } },
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
          take: 50,
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection || !collection.isActive) {
      const error: any = new Error('Collection not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...this.formatCollection(collection),
      products: collection.products
        .filter((cp) => cp.product.status === 'ACTIVE')
        .map((cp) => cp.product),
    };
  }

  async getCollectionById(id: string): Promise<CollectionResponseDTO> {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      const error: any = new Error('Collection not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatCollection(collection);
  }

  async createCollection(data: CreateCollectionDTO): Promise<CollectionResponseDTO> {
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!slug) slug = `collection-${Date.now()}`;

    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const collection = await prisma.collection.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        bannerImage: data.bannerImage?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.formatCollection(collection);
  }

  async updateCollection(id: string, data: UpdateCollectionDTO): Promise<CollectionResponseDTO> {
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error('Collection not found');
      error.statusCode = 404;
      throw error;
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = generateSlug(data.slug);
      const duplicate = await prisma.collection.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        const error: any = new Error('Collection with this slug already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.slug !== undefined && { slug }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.bannerImage !== undefined && { bannerImage: data.bannerImage?.trim() || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.formatCollection(collection);
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error('Collection not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.collection.delete({ where: { id } });
    return { message: 'Collection deleted successfully' };
  }
}

export const collectionsService = new CollectionsService();
