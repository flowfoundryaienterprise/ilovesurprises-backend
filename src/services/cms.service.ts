import { prisma } from '../lib/prisma';
import { CmsPageDTO, CmsBannerDTO, CmsNavigationItemDTO } from '../types/cms.types';

export class CmsService {
  async getPageBySlug(slug: string): Promise<CmsPageDTO | null> {
    const clean = slug.trim().toLowerCase();
    const page = await prisma.cmsPage.findFirst({
      where: { slug: clean, isPublished: true },
    });
    return page;
  }

  async getBanners(position?: string): Promise<CmsBannerDTO[]> {
    const where: any = { isActive: true };
    if (position) where.position = position;

    const banners = await prisma.cmsBanner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return banners;
  }

  async getNavigation(location = 'HEADER'): Promise<CmsNavigationItemDTO[]> {
    const rootItems = await prisma.cmsNavigationItem.findMany({
      where: { location, isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return rootItems.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      parentId: item.parentId,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      location: item.location,
      children: item.children.map((c) => ({
        id: c.id,
        label: c.label,
        url: c.url,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        location: c.location,
      })),
    }));
  }

  // Admin CRUD for CMS Pages
  async adminListPages(): Promise<CmsPageDTO[]> {
    return await prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async adminCreatePage(data: any): Promise<CmsPageDTO> {
    return await prisma.cmsPage.create({ data });
  }

  async adminUpdatePage(id: string, data: any): Promise<CmsPageDTO> {
    return await prisma.cmsPage.update({ where: { id }, data });
  }

  async adminDeletePage(id: string): Promise<void> {
    await prisma.cmsPage.delete({ where: { id } });
  }

  // Admin CRUD for Banners
  async adminListBanners(): Promise<CmsBannerDTO[]> {
    return await prisma.cmsBanner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async adminCreateBanner(data: any): Promise<CmsBannerDTO> {
    return await prisma.cmsBanner.create({ data });
  }

  async adminUpdateBanner(id: string, data: any): Promise<CmsBannerDTO> {
    return await prisma.cmsBanner.update({ where: { id }, data });
  }

  async adminDeleteBanner(id: string): Promise<void> {
    await prisma.cmsBanner.delete({ where: { id } });
  }
}

export const cmsService = new CmsService();
