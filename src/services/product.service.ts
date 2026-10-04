import { prisma } from '../lib/prisma';
import {
  ProductResponseDTO,
  ListProductsQueryDTO,
  CreateProductDTO,
  UpdateProductDTO,
  CreateReviewDTO,
  ScentOption,
} from '../types/product.types';
import { Prisma, ProductStatus } from '@prisma/client';

export const DEFAULT_CATALOG: readonly ProductResponseDTO[] = [
  {
    id: 'prod-halloween-bath-bomb-01',
    name: "Creepin' real this halloween Fragrance Bath Bombs",
    slug: 'creepin-real-this-halloween-fragrance-bath-bombs',
    shortDescription: 'Limited-edition Halloween reveal candles & bath treats with cash and jewelry inside worth up to $7,500.',
    description: 'Crafted with 100% natural organic soy wax, clean aromatic oils, and lead-free cotton wicks for a long-lasting, clean burn. Hand-poured in the USA.',
    price: 19.99,
    compareAtPrice: 29.99,
    imageUrl: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png',
    images: [
      'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Halloween.png',
    ],
    categoryId: 'cat-halloween',
    categoryName: 'CANDLES',
    badge: 'CANDLES',
    rating: 4.8,
    reviewCount: 0,
    stock: 50,
    inStock: true,
    lowStockThreshold: 5,
    sku: 'HLW-BATH-BOMB-01',
    isBestSeller: true,
    isNew: true,
    status: ProductStatus.ACTIVE,
    scentNotes: [
      '1. Pumpkin Spice 🎃 (Halloween Priority Scent)',
      '2. Spooky Spiced Apple Cider 🍎',
      '3. Midnight Marshmallow Cauldron 👻',
    ],
    scentOptions: [
      {
        id: 'scent-pumpkin-spice',
        name: '1. Pumpkin Spice 🎃 (Halloween Priority Scent)',
        subtitle: 'Pumpkin Spice is curated #1 holiday favorite for this item.',
        isPriority: true,
      },
      {
        id: 'scent-apple-cider',
        name: '2. Spooky Spiced Apple Cider 🍎',
        subtitle: 'Warm orchard apples steeped with cinnamon and clove.',
      },
      {
        id: 'scent-cauldron-marshmallow',
        name: '3. Midnight Marshmallow Cauldron 👻',
        subtitle: 'Toasted vanilla marshmallow with smoky caramel.',
      },
    ],
    ringSizes: ['5', '6', '7', '8', '9', '10'],
    jewelryTypes: ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
    limitedBatchInfo: {
      badge: 'LIMITED SURPRISE BATCH',
      urgencyText: 'Order in next 02h 44m to ship today!',
      countdownHours: 2,
      countdownMinutes: 44,
      countdownSeconds: 38,
    },
    surpriseRevealInfo: {
      badge: 'Guaranteed Fine Jewelry Inside',
      valueRange: 'Jewelry inside worth $10 - $7,500',
      description:
        'Every single handcrafted product holds a sealed, waterproof, heat-resistant capsule with your guaranteed surprise. Burn or unwrap to reveal your treasure!',
      appraisalCallout:
        'Your ring surprise will be tailored in Size 7 appraised $10 to $7,500. Already revealed your jewelry? Check appraisal value & certificate ->',
    },
    trustBadges: ['100% Win Guarantee', 'Free Shipping $50+', '30-Day Returns', 'Made in USA'],
    reviewsSummary: {
      overallRating: 4.8,
      maxRating: 5.0,
      totalReviews: 0,
      breakdown: [
        { stars: 5, percentage: 88, count: 0 },
        { stars: 4, percentage: 9, count: 0 },
        { stars: 3, percentage: 2, count: 0 },
        { stars: 2, percentage: 1, count: 0 },
        { stars: 1, percentage: 0, count: 0 },
      ],
      appraisedValueRange: '$10 - $7,500',
      guaranteeBadge: '100% Win Guarantee Verified',
    },
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-christmas-x-02',
    name: 'Christmas X Holiday Priority Candle',
    slug: 'christmas-x-holiday-priority-candle',
    shortDescription: 'Festive holiday reveal candle featuring certified diamond jewelry and cash surprises inside.',
    description: 'Brimming with fresh balsam pine, warm cinnamon bark, and vanilla sugar. Includes a guaranteed holiday jewelry or cash reveal worth up to $5,000.',
    price: 24.99,
    compareAtPrice: 34.99,
    imageUrl: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Christmas.png',
    images: [
      'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Christmas.png',
    ],
    categoryId: 'cat-christmas',
    categoryName: 'CANDLES',
    badge: 'Holiday Priority',
    rating: 4.9,
    reviewCount: 12,
    stock: 65,
    inStock: true,
    lowStockThreshold: 5,
    sku: 'XMAS-CANDLE-02',
    isBestSeller: true,
    isNew: true,
    status: ProductStatus.ACTIVE,
    scentNotes: ['Winter Balsam & Pine 🎄', 'Cinnamon Sugar Cookie 🍪', 'Frosted Cranberry ❄️'],
    scentOptions: [
      { id: 'scent-balsam', name: 'Winter Balsam & Pine 🎄', isPriority: true },
      { id: 'scent-cookie', name: 'Cinnamon Sugar Cookie 🍪' },
      { id: 'scent-cranberry', name: 'Frosted Cranberry ❄️' },
    ],
    ringSizes: ['5', '6', '7', '8', '9', '10'],
    jewelryTypes: ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
    limitedBatchInfo: {
      badge: 'LIMITED SURPRISE BATCH',
      urgencyText: 'Holiday Batch: Ships within 24 hours!',
      countdownHours: 4,
      countdownMinutes: 15,
      countdownSeconds: 0,
    },
    surpriseRevealInfo: {
      badge: 'Guaranteed Fine Jewelry Inside',
      valueRange: 'Jewelry inside worth $15 - $5,000',
      description: 'Contains sealed genuine diamond jewelry or cash surprise in every jar.',
      appraisalCallout: 'Appraised certificate included with every reveal.',
    },
    trustBadges: ['100% Win Guarantee', 'Free Shipping $50+', '30-Day Returns', 'Made in USA'],
    reviewsSummary: {
      overallRating: 4.9,
      maxRating: 5.0,
      totalReviews: 12,
      breakdown: [
        { stars: 5, percentage: 92, count: 11 },
        { stars: 4, percentage: 8, count: 1 },
        { stars: 3, percentage: 0, count: 0 },
        { stars: 2, percentage: 0, count: 0 },
        { stars: 1, percentage: 0, count: 0 },
      ],
      appraisedValueRange: '$15 - $5,000',
      guaranteeBadge: '100% Win Guarantee Verified',
    },
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-cash-candles-03',
    name: 'Cash Candles Deluxe Hunt Candle',
    slug: 'cash-candles-deluxe-hunt-candle',
    shortDescription: 'Every candle holds real cash inside from $2 up to $2,500 cold hard cash.',
    description: 'Clean burning soy candle infused with crisp clean linen fragrance. Unwrap real cash bills sealed inside heat-resistant foil.',
    price: 24.99,
    compareAtPrice: null,
    imageUrl: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Cash.png',
    images: [
      'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Cash.png',
    ],
    categoryId: 'cat-cash-candles',
    categoryName: 'CANDLES',
    badge: 'Win Up To $2,500',
    rating: 4.7,
    reviewCount: 28,
    stock: 40,
    inStock: true,
    lowStockThreshold: 5,
    sku: 'CASH-CANDLE-03',
    isBestSeller: true,
    isNew: false,
    status: ProductStatus.ACTIVE,
    scentNotes: ['Fresh Crisp Linen 💵', 'Vanilla Gold Rush 🪙', 'Sandalwood & Cashmere 💎'],
    scentOptions: [
      { id: 'scent-linen', name: 'Fresh Crisp Linen 💵', isPriority: true },
      { id: 'scent-vanilla-gold', name: 'Vanilla Gold Rush 🪙' },
      { id: 'scent-sandalwood', name: 'Sandalwood & Cashmere 💎' },
    ],
    ringSizes: [],
    jewelryTypes: ['Cash Reveal Only'],
    limitedBatchInfo: {
      badge: 'CASH PRIZE BATCH',
      urgencyText: 'Order today to claim high denomination capsules!',
      countdownHours: 3,
      countdownMinutes: 20,
      countdownSeconds: 15,
    },
    surpriseRevealInfo: {
      badge: 'Real Cash Inside',
      valueRange: 'Cash inside worth $2 - $2,500',
      description: 'Cold hard USD cash sealed in every candle. Burn to reveal your cash packet.',
      appraisalCallout: '1 in 50 candles contains $100 or higher cash bill!',
    },
    trustBadges: ['100% Win Guarantee', 'Free Shipping $50+', '30-Day Returns', 'Made in USA'],
    reviewsSummary: {
      overallRating: 4.7,
      maxRating: 5.0,
      totalReviews: 28,
      breakdown: [
        { stars: 5, percentage: 85, count: 24 },
        { stars: 4, percentage: 11, count: 3 },
        { stars: 3, percentage: 4, count: 1 },
        { stars: 2, percentage: 0, count: 0 },
        { stars: 1, percentage: 0, count: 0 },
      ],
      appraisedValueRange: '$2 - $2,500 Real Cash',
      guaranteeBadge: '100% Win Guarantee Verified',
    },
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date(),
  },
  {
    id: 'prod-zodiac-cash-04',
    name: 'Zodiac Celestial Birthstone & Cash Candle',
    slug: 'zodiac-celestial-birthstone-cash-candle',
    shortDescription: 'Astrology-inspired surprise candle personalized to your celestial birth chart with real cash & gemstone inside.',
    description: 'Handcrafted soy blend topped with real crushed amethyst and starlight glitter. Each candle holds a certified gemstone or cash prize inside.',
    price: 29.99,
    compareAtPrice: 39.99,
    imageUrl: 'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Zodiac.png',
    images: [
      'https://cdn.shopify.com/s/files/1/0172/4672/products/4_Mockup_Jewelry_Jewelry_Candle_Zodiac.png',
    ],
    categoryId: 'cat-zodiac',
    categoryName: 'CANDLES',
    badge: 'Real Cash Inside',
    rating: 4.8,
    reviewCount: 19,
    stock: 35,
    inStock: true,
    lowStockThreshold: 5,
    sku: 'ZODIAC-CANDLE-04',
    isBestSeller: false,
    isNew: true,
    status: ProductStatus.ACTIVE,
    scentNotes: ['Celestial Lavender & Starlight 🔮', 'Moonlit Jasmine & Sandalwood 🌙', 'Solar Citrus Aura ☀️'],
    scentOptions: [
      { id: 'scent-lavender', name: 'Celestial Lavender & Starlight 🔮', isPriority: true },
      { id: 'scent-jasmine', name: 'Moonlit Jasmine & Sandalwood 🌙' },
      { id: 'scent-citrus', name: 'Solar Citrus Aura ☀️' },
    ],
    ringSizes: ['5', '6', '7', '8', '9', '10'],
    jewelryTypes: ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
    limitedBatchInfo: {
      badge: 'LIMITED SURPRISE BATCH',
      urgencyText: 'Order now for next astrological transit dispatch!',
      countdownHours: 1,
      countdownMinutes: 50,
      countdownSeconds: 45,
    },
    surpriseRevealInfo: {
      badge: 'Guaranteed Fine Jewelry & Cash Inside',
      valueRange: 'Prizes inside worth $10 - $5,000',
      description: 'Zodiac gemstone jewelry or cash sealed in waterproof capsule.',
      appraisalCallout: 'Includes personalized zodiac affirmation certificate.',
    },
    trustBadges: ['100% Win Guarantee', 'Free Shipping $50+', '30-Day Returns', 'Made in USA'],
    reviewsSummary: {
      overallRating: 4.8,
      maxRating: 5.0,
      totalReviews: 19,
      breakdown: [
        { stars: 5, percentage: 89, count: 17 },
        { stars: 4, percentage: 11, count: 2 },
        { stars: 3, percentage: 0, count: 0 },
        { stars: 2, percentage: 0, count: 0 },
        { stars: 1, percentage: 0, count: 0 },
      ],
      appraisedValueRange: '$10 - $5,000',
      guaranteeBadge: '100% Win Guarantee Verified',
    },
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date(),
  },
];

export const formatDbProduct = (product: any): ProductResponseDTO => {
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  if (product.product_images && Array.isArray(product.product_images)) {
    product.product_images.forEach((img: any) => {
      if (img.url && !images.includes(img.url)) images.push(img.url);
    });
  }

  const scentNotes = Array.isArray(product.scentNotes) ? product.scentNotes : [];
  const ringSizes =
    Array.isArray(product.ringSizes) && product.ringSizes.length > 0
      ? product.ringSizes
      : ['5', '6', '7', '8', '9', '10'];
  const jewelryTypes =
    Array.isArray(product.jewelryTypes) && product.jewelryTypes.length > 0
      ? product.jewelryTypes
      : ['Ring', 'Necklace', 'Earrings', 'Bracelet'];

  const scentOptions: ScentOption[] = scentNotes.map((name: string, index: number) => ({
    id: `scent-${index + 1}`,
    name,
    subtitle:
      index === 0 ? `${name.split(' ')[1] || name} is curated #1 holiday favorite for this item.` : undefined,
    isPriority: index === 0,
  }));

  const maxVal = product.surpriseValue ? Number(product.surpriseValue) : 7500;
  const valueRange = `Jewelry inside worth $10 - $${maxVal.toLocaleString()}`;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    imageUrl: product.imageUrl || (images[0] || null),
    images,
    categoryId: product.categoryId,
    categoryName: product.categories?.name || product.badge || 'CANDLES',
    badge: product.badge || 'CANDLES',
    rating: product.rating ? Number(product.rating) : 4.8,
    reviewCount: product.reviewCount || 0,
    stock: product.stock ?? 50,
    inStock: (product.stock ?? 50) > 0,
    lowStockThreshold: product.lowStockThreshold || 5,
    sku: product.sku,
    isBestSeller: Boolean(product.isBestSeller),
    isNew: Boolean(product.isNew),
    status: product.status || ProductStatus.ACTIVE,
    scentNotes,
    scentOptions,
    ringSizes,
    jewelryTypes,
    limitedBatchInfo: {
      badge: 'LIMITED SURPRISE BATCH',
      urgencyText: 'Order in next 02h 44m to ship today!',
      countdownHours: 2,
      countdownMinutes: 44,
      countdownSeconds: 38,
    },
    surpriseRevealInfo: {
      badge: 'Guaranteed Fine Jewelry Inside',
      valueRange,
      description:
        'Every single handcrafted product holds a sealed, waterproof, heat-resistant capsule with your guaranteed surprise. Burn or unwrap to reveal your treasure!',
      appraisalCallout: `Your ring surprise will be tailored in Size 7 appraised $10 to $${maxVal.toLocaleString()}. Already revealed your jewelry? Check appraisal value & certificate ->`,
    },
    trustBadges: ['100% Win Guarantee', 'Free Shipping $50+', '30-Day Returns', 'Made in USA'],
    reviewsSummary: {
      overallRating: product.rating ? Number(product.rating) : 4.8,
      maxRating: 5.0,
      totalReviews: product.reviewCount || 0,
      breakdown: [
        { stars: 5, percentage: 88, count: 0 },
        { stars: 4, percentage: 9, count: 0 },
        { stars: 3, percentage: 2, count: 0 },
        { stars: 2, percentage: 1, count: 0 },
        { stars: 1, percentage: 0, count: 0 },
      ],
      appraisedValueRange: valueRange,
      guaranteeBadge: '100% Win Guarantee Verified',
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const listProducts = async (query: ListProductsQueryDTO): Promise<{
  products: ProductResponseDTO[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 20));
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.productsWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.featured) {
      where.isBestSeller = true;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { badge: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.category) {
      where.OR = [
        { categoryId: query.category },
        { categories: { slug: { equals: query.category, mode: 'insensitive' } } },
        { categories: { name: { contains: query.category, mode: 'insensitive' } } },
        { badge: { contains: query.category, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.productsOrderByWithRelationInput = {};
    if (query.sortBy === 'price-asc') orderBy.price = 'asc';
    else if (query.sortBy === 'price-desc') orderBy.price = 'desc';
    else if (query.sortBy === 'rating') orderBy.rating = 'desc';
    else if (query.sortBy === 'bestseller') orderBy.isBestSeller = 'desc';
    else orderBy.createdAt = 'desc';

    const [dbTotal, dbProducts] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categories: true,
          product_images: { orderBy: { sortOrder: 'asc' } },
          product_variants: true,
        },
      }),
    ]);

    if (dbProducts.length > 0) {
      return {
        products: dbProducts.map(formatDbProduct),
        pagination: {
          total: dbTotal,
          page,
          limit,
          totalPages: Math.ceil(dbTotal / limit),
        },
      };
    }
  } catch (err: any) {
    console.warn('DB query in listProducts fell back to default catalog:', err.message);
  }

  let filtered = [...DEFAULT_CATALOG];
  if (query.search) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  if (query.category) {
    const cat = query.category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.categoryName?.toLowerCase().includes(cat) ||
        p.badge?.toLowerCase().includes(cat) ||
        p.categoryId?.toLowerCase() === cat
    );
  }
  if (query.featured) {
    filtered = filtered.filter((p) => p.isBestSeller);
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductByIdOrSlug = async (identifier: string): Promise<ProductResponseDTO> => {
  const cleanId = identifier.trim();

  try {
    const dbProduct = await prisma.products.findFirst({
      where: {
        OR: [{ id: cleanId }, { slug: cleanId }],
      },
      include: {
        categories: true,
        product_images: { orderBy: { sortOrder: 'asc' } },
        product_variants: true,
        product_reviews: {
          include: { users: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (dbProduct) {
      return formatDbProduct(dbProduct);
    }
  } catch (err: any) {
    console.warn('DB query in getProductByIdOrSlug failed, checking catalog:', err.message);
  }

  const matched = DEFAULT_CATALOG.find(
    (p) => p.id === cleanId || p.slug.toLowerCase() === cleanId.toLowerCase()
  );

  if (matched) {
    return matched;
  }

  const error: any = new Error(`Product with identifier "${identifier}" not found`);
  error.statusCode = 404;
  throw error;
};

export const createReview = async (productId: string, userId: string, data: CreateReviewDTO): Promise<any> => {
  try {
    const product = await getProductByIdOrSlug(productId);

    const review = await prisma.product_reviews.create({
      data: {
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        userId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        isApproved: true,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return review;
  } catch (err: any) {
    if (err.statusCode) throw err;
    return {
      id: `rev-${Date.now()}`,
      productId,
      userId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      createdAt: new Date(),
    };
  }
};

export const createProduct = async (data: CreateProductDTO): Promise<ProductResponseDTO> => {
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const created = await prisma.products.create({
    data: {
      id,
      name: data.name,
      slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      imageUrl: data.imageUrl || null,
      categoryId: data.categoryId || null,
      surpriseType: data.surpriseType || 'JEWELRY',
      surpriseValue: data.surpriseValue || 7500,
      badge: data.badge || 'CANDLES',
      stock: data.stock || 50,
      lowStockThreshold: data.lowStockThreshold || 5,
      sku: data.sku || null,
      isBestSeller: data.isBestSeller || false,
      isNew: data.isNew || true,
      scentNotes: data.scentNotes || [],
      ringSizes: data.ringSizes || ['5', '6', '7', '8', '9', '10'],
      jewelryTypes: data.jewelryTypes || ['Ring', 'Necklace', 'Earrings', 'Bracelet'],
      status: data.status || ProductStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      categories: true,
      product_images: true,
    },
  });

  return formatDbProduct(created);
};

export const updateProduct = async (id: string, data: UpdateProductDTO): Promise<ProductResponseDTO> => {
  const updated = await prisma.products.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.badge !== undefined && { badge: data.badge }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.status && { status: data.status }),
      ...(data.scentNotes && { scentNotes: data.scentNotes }),
      ...(data.ringSizes && { ringSizes: data.ringSizes }),
      ...(data.jewelryTypes && { jewelryTypes: data.jewelryTypes }),
      updatedAt: new Date(),
    },
    include: {
      categories: true,
      product_images: true,
    },
  });

  return formatDbProduct(updated);
};

export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  await prisma.products.delete({
    where: { id },
  });

  return { message: 'Product deleted successfully' };
};

// Backward compatibility object export
export const productService = {
  formatProduct: formatDbProduct,
  listProducts,
  getProductByIdOrSlug,
  createReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
