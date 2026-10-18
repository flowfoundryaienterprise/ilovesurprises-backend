import { z } from 'zod';

export const listAppraisalsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
    search: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    section: z.string().optional(),
    tab: z.string().optional(),
  }),
});

export const createAppraisalSchema = z.object({
  body: z.object({
    appraisalCode: z.string().optional(),
    code: z.string().optional(),
    estimatedValue: z.number().min(0, 'Estimated value must be non-negative'),
    appraisedValue: z.number().min(0).optional(),
    jewelryName: z.string().optional(),
    name: z.string().optional(),
    jewelryType: z.string().optional(),
    type: z.string().optional(),
    metalType: z.string().optional(),
    material: z.string().optional(),
    gemstoneType: z.string().optional(),
    stone: z.string().optional(),
    cutSetting: z.string().optional(),
    jewelryImagePreset: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    orderNumber: z.string().optional(),
    orderId: z.string().optional(),
    sourceProduct: z.string().optional(),
    productName: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().optional(),
    artisanDescription: z.string().optional(),
    status: z.string().optional(),
    serialNumber: z.string().optional(),
    certificateNumber: z.string().optional(),
    inspectedDate: z.string().optional(),
    notes: z.string().optional(),
  }).refine((data) => Boolean(data.appraisalCode || data.code), {
    message: 'Jewelry code is required',
    path: ['code'],
  }),
});

export const updateAppraisalSchema = z.object({
  body: z.object({
    appraisalCode: z.string().optional(),
    code: z.string().optional(),
    estimatedValue: z.number().min(0).optional(),
    appraisedValue: z.number().min(0).optional(),
    jewelryName: z.string().optional(),
    name: z.string().optional(),
    jewelryType: z.string().optional(),
    type: z.string().optional(),
    metalType: z.string().optional(),
    material: z.string().optional(),
    gemstoneType: z.string().optional(),
    stone: z.string().optional(),
    cutSetting: z.string().optional(),
    jewelryImagePreset: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    orderNumber: z.string().optional(),
    orderId: z.string().optional(),
    sourceProduct: z.string().optional(),
    productName: z.string().optional(),
    productId: z.string().optional(),
    description: z.string().optional(),
    artisanDescription: z.string().optional(),
    status: z.string().optional(),
    serialNumber: z.string().optional(),
    certificateNumber: z.string().optional(),
    inspectedDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const submitCustomerAppraisalSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    name: z.string().optional(),
    fullName: z.string().optional(),
    customerEmail: z.string().optional(),
    email: z.string().optional(),
    customerPhone: z.string().optional(),
    phone: z.string().optional(),
    orderNumber: z.string().optional(),
    orderId: z.string().optional(),
    productName: z.string().optional(),
    product: z.string().optional(),
    sourceProduct: z.string().optional(),
    jewelryType: z.string().optional(),
    type: z.string().optional(),
    metalType: z.string().optional(),
    material: z.string().optional(),
    gemstoneType: z.string().optional(),
    stone: z.string().optional(),
    codeInfo: z.string().optional(),
    appraisalCode: z.string().optional(),
    code: z.string().optional(),
    tagCode: z.string().optional(),
    photoPreviews: z.union([z.array(z.string()), z.string()]).optional(),
    images: z.union([z.array(z.string()), z.string()]).optional(),
    photos: z.union([z.array(z.string()), z.string()]).optional(),
    notes: z.string().optional(),
    description: z.string().optional(),
    estimatedValue: z.preprocess((v) => (v !== undefined && v !== '' ? Number(v) : undefined), z.number().min(0).optional()),
  }).transform((data) => {
    const toArray = (val: string[] | string | undefined): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    const combinedImages = [
      ...toArray(data.photoPreviews),
      ...toArray(data.images),
      ...toArray(data.photos),
    ].filter(Boolean);

    return {
      customerName: (data.customerName || data.name || data.fullName || '').trim(),
      customerEmail: (data.customerEmail || data.email || '').trim(),
      customerPhone: data.customerPhone || data.phone,
      orderNumber: (data.orderNumber || data.orderId || '').trim() || undefined,
      productName: (data.productName || data.product || data.sourceProduct || 'Surprise Reveal Candle').trim(),
      jewelryType: (data.jewelryType || data.type || 'Ring').trim(),
      metalType: data.metalType || data.material,
      gemstoneType: data.gemstoneType || data.stone,
      codeInfo: (data.codeInfo || data.appraisalCode || data.code || data.tagCode || '').trim() || undefined,
      photoPreviews: combinedImages,
      images: combinedImages,
      photos: combinedImages,
      notes: (data.notes || data.description || '').trim() || undefined,
      estimatedValue: data.estimatedValue,
    };
  }).refine((data) => Boolean(data.customerName && data.customerName.length > 0), {
    message: 'Customer name is required',
    path: ['customerName'],
  }).refine((data) => Boolean(data.customerEmail && data.customerEmail.includes('@')), {
    message: 'Valid customer email is required',
    path: ['customerEmail'],
  }),
});

export const updateCustomerSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'reviewed', 'approved', 'rejected', 'SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED']).optional(),
    notes: z.string().optional(),
    appraiserNotes: z.string().optional(),
    customerNotes: z.string().optional(),
    estimatedValue: z.number().min(0).optional(),
    appraisedValue: z.number().min(0).optional(),
  }),
});

export const lookupAppraisalCodeSchema = z.object({
  params: z.object({
    code: z.string().min(1, 'Appraisal code is required'),
  }),
});
