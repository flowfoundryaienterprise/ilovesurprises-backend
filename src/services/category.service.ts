import { prisma } from '../lib/prisma';
import { generateSlug } from '../utils/slug';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO } from '../types/category.types';

export class CategoriesService {
  private formatCategory(cat: any): CategoryResponseDTO {
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      children: cat.children ? cat.children.map((c: any) => this.formatCategory(c)) : undefined,
      _count: cat._count,
    };
  }

  async listCategories(includeInactive = false): Promise<CategoryResponseDTO[]> {
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map((c) => this.formatCategory(c));
  }

  async getCategoryBySlug(slug: string): Promise<any> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: { status: 'ACTIVE' },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { where: { isActive: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category || !category.isActive) {
      const error: any = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatCategory(category);
  }

  async getCategoryById(id: string): Promise<CategoryResponseDTO> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      const error: any = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    return this.formatCategory(category);
  }

  async createCategory(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    if (!slug) slug = `category-${Date.now()}`;

    // Ensure unique slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        const error: any = new Error('Parent category not found');
        error.statusCode = 400;
        throw error;
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.formatCategory(category);
  }

  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      const error: any = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      slug = generateSlug(data.slug);
      const duplicate = await prisma.category.findUnique({ where: { slug } });
      if (duplicate && duplicate.id !== id) {
        const error: any = new Error('Category with this slug already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    if (data.parentId) {
      if (data.parentId === id) {
        const error: any = new Error('Category cannot be its own parent');
        error.statusCode = 400;
        throw error;
      }
      const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        const error: any = new Error('Parent category not found');
        error.statusCode = 400;
        throw error;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.slug !== undefined && { slug }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.image !== undefined && { image: data.image?.trim() || null }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return this.formatCategory(category);
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!existing) {
      const error: any = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Unlink products first to avoid violating foreign keys
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // Unlink children categories
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully' };
  }
}

export const categoriesService = new CategoriesService();
