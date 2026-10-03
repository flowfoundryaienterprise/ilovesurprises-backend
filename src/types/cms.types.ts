export interface CmsPageDTO {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CmsBannerDTO {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CmsNavigationItemDTO {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  location: string;
  children?: CmsNavigationItemDTO[];
}
