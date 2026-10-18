import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { saveBase64Image } from '../middlewares/upload.middleware';
import {
  JewelryAppraisal,
  PublicAppraisalResult,
  AppraisalLookupResponse,
  CustomerAppraisalSubmission,
  AppraisalStatsResponse,
  CreateAppraisalDTO,
  UpdateAppraisalDTO,
  SubmitCustomerAppraisalDTO,
  UpdateCustomerSubmissionDTO,
  JewelryType,
} from '../types/appraisal.types';

export const DEFAULT_APPRAISALS = [
  {
    id: 'appr-001',
    code: 'ILS-DIAMOND-777',
    name: '1.25ct Solitaire Round Brilliant Diamond Ring',
    type: 'Ring' as JewelryType,
    estimatedValue: 1850,
    image: '/assets/ilovesurprises/categories/1_Mockup_Jewelry_JewelryCandles_93d459aa-d530-474d-ba4c-32fb9af4f94c.jpg',
    material: 'Solid 14k White Gold',
    stone: 'Lab-Grown F/VS1 Diamond',
    cutSetting: 'Classic 4-Prong Cathedral Setting',
    description: 'Certified appraisal: Exquisite round brilliant center solitaire stone with exceptional clarity and fire.',
    status: 'active' as const,
    serialNumber: 'ILS-DIA-777-CERT',
    inspectedDate: '2025-10-15',
  },
  {
    id: 'appr-002',
    code: 'LUCKY999',
    name: 'Grand Cash Reveal ($2,500 Grand Prize Certificate)',
    type: 'Pendant' as JewelryType,
    estimatedValue: 2500,
    image: '/assets/ilovesurprises/categories/cash_candles.jpg',
    material: 'Certified Cash Voucher & Sterling Silver Keepsake',
    stone: 'Collector Reveal Seal',
    cutSetting: 'Secure Protective Foil Capsule',
    description: 'Grand Tier cash prize reveal verified and backed by the I Love Surprises Founder Reserve.',
    status: 'active' as const,
    serialNumber: 'LUCKY-999-VERIFIED',
    inspectedDate: '2025-11-01',
  },
  {
    id: 'appr-003',
    code: 'RUBY5000',
    name: 'Vintage Oval Ruby & Diamond Halo Ring',
    type: 'Ring' as JewelryType,
    estimatedValue: 750,
    image: '/assets/ilovesurprises/categories/1_Mockup_Jewelry_JewelryCandles_93d459aa-d530-474d-ba4c-32fb9af4f94c.jpg',
    material: 'Solid .925 Sterling Silver',
    stone: 'Natural Burma Red Ruby (1.10ct)',
    cutSetting: 'Prong-Set Halo with Pavé Shoulders',
    description: 'Deep pigeon blood natural ruby encircled by brilliant white simulated diamonds.',
    status: 'active' as const,
    serialNumber: 'ILS-RUBY-5000-C',
    inspectedDate: '2025-11-10',
  },
];

export const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-001',
    code: 'SUB-ILS-SARAH-01',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    customerPhone: '555-0199',
    orderNumber: 'ILS-89104-US',
    productName: 'Midnight Amber Cash Candle',
    jewelryType: 'Ring',
    metalType: 'Solid .925 Sterling Silver',
    gemstoneType: 'AAA Cubic Zirconia',
    codeInfo: 'ILS-RUBY-500',
    images: ['/assets/ilovesurprises/appraisals/sterling-silver-halo-ring.jpg'],
    status: 'pending',
    notes: 'Customer discovered size 7 ring inside candle. Requesting official appraisal verification.',
    estimatedValue: 250,
  },
];

/**
 * Normalizes code
 */
export function normalizeCode(code: string): string {
  return (code || '').trim().toUpperCase();
}

/**
 * Helper to parse metadata stored in appraiserNotes
 */
function parseNotesMeta(notes: string | null | undefined): { notesText: string; meta: any } {
  if (!notes) return { notesText: '', meta: {} };
  try {
    if (notes.startsWith('{')) {
      const parsed = JSON.parse(notes);
      return { notesText: parsed.notes || '', meta: parsed };
    }
  } catch {
    // plain string
  }
  return { notesText: notes, meta: {} };
}

/**
 * Ensures default appraisal codes and submissions exist in database if empty
 */
export async function seedDefaultAppraisalsIfEmpty(): Promise<void> {
  const count = await prisma.appraisal_records.count();
  if (count === 0) {
    // Seed default certificate codes
    for (const item of DEFAULT_APPRAISALS) {
      const meta = {
        name: item.name,
        jewelryName: item.name,
        cutSetting: item.cutSetting,
        serialNumber: item.serialNumber,
        inspectedDate: item.inspectedDate,
        isCertificate: true,
      };

      await prisma.appraisal_records.create({
        data: {
          id: item.id,
          appraisalCode: normalizeCode(item.code),
          customerName: 'Pre-minted Certificate',
          customerEmail: 'unclaimed@ilovesurprises.com',
          jewelryType: item.type,
          metalType: item.material,
          gemstoneType: item.stone,
          description: item.description,
          images: [item.image],
          estimatedValue: item.estimatedValue,
          appraisedValue: item.estimatedValue,
          appraiserNotes: JSON.stringify(meta),
          certificateNumber: item.serialNumber,
          status: 'ACTIVE',
          appraisedAt: new Date(item.inspectedDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Seed default submission
    for (const sub of DEFAULT_SUBMISSIONS) {
      const meta = {
        name: `${sub.jewelryType} Reveal Submission`,
        productName: sub.productName,
        orderNumber: sub.orderNumber,
        codeInfo: sub.codeInfo,
        isSubmission: true,
        notes: sub.notes,
      };

      await prisma.appraisal_records.create({
        data: {
          id: sub.id,
          appraisalCode: normalizeCode(sub.code),
          customerName: sub.customerName,
          customerEmail: sub.customerEmail,
          customerPhone: sub.customerPhone,
          jewelryType: sub.jewelryType,
          metalType: sub.metalType,
          gemstoneType: sub.gemstoneType,
          description: sub.notes,
          images: sub.images,
          estimatedValue: sub.estimatedValue,
          appraisedValue: sub.estimatedValue,
          appraiserNotes: JSON.stringify(meta),
          certificateNumber: `SUB-CERT-${Date.now()}`,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }
}

/**
 * Formats a Prisma record into a rich JewelryAppraisal object
 */
export function formatJewelryAppraisal(record: any): JewelryAppraisal {
  const { notesText, meta } = parseNotesMeta(record.appraiserNotes);
  const name = meta.jewelryName || meta.name || `${record.jewelryType || 'Jewelry'} Reveal Surprise`;
  const estimatedVal = Number(record.estimatedValue || record.appraisedValue || 0);
  const appraisedVal = Number(record.appraisedValue || record.estimatedValue || 0);
  const firstImage = record.images && record.images.length > 0 ? record.images[0] : '';
  const serial = record.certificateNumber || meta.serialNumber || `ILS-CERT-${record.appraisalCode}`;
  const inspectedDate = record.appraisedAt
    ? record.appraisedAt.toISOString().split('T')[0]
    : meta.inspectedDate || record.createdAt.toISOString().split('T')[0];

  const rawStatus = (record.status || 'ACTIVE').toLowerCase();
  const status = rawStatus === 'archived' ? 'archived' : 'active';

  return {
    id: record.id,
    code: record.appraisalCode,
    appraisalCode: record.appraisalCode,
    name,
    jewelryName: name,
    type: (record.jewelryType || 'Ring') as JewelryType,
    jewelryType: record.jewelryType || 'Ring',
    estimatedValue: estimatedVal,
    retailValue: estimatedVal,
    appraisedValue: appraisedVal,
    image: firstImage,
    images: record.images || [],
    jewelryImagePreset: firstImage,
    material: record.metalType || meta.material || 'Solid .925 Sterling Silver',
    metalType: record.metalType || meta.material || 'Solid .925 Sterling Silver',
    stone: record.gemstoneType || meta.stone || 'Natural Gemstone',
    gemstoneType: record.gemstoneType || meta.stone || 'Natural Gemstone',
    cutSetting: meta.cutSetting || 'Artisan Setting',
    specsAndMaterials: `${record.metalType || 'Sterling Silver'} • ${record.gemstoneType || 'Gemstone'}`,
    description: record.description || 'Handcrafted genuine fine jewelry surprise reveal.',
    artisanDescription: record.description || 'Handcrafted genuine fine jewelry surprise reveal.',
    status,
    serialNumber: serial,
    certificateNumber: serial,
    inspectedDate,
    appraisedAt: record.appraisedAt ? record.appraisedAt.toISOString() : undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    customerName: record.customerName !== 'Pre-minted Certificate' ? record.customerName : undefined,
    customerEmail: record.customerEmail !== 'unclaimed@ilovesurprises.com' ? record.customerEmail : undefined,
    orderNumber: meta.orderNumber,
    orderId: meta.orderNumber || meta.orderId,
    sourceProduct: meta.sourceProduct || meta.productName,
    productName: meta.productName || meta.sourceProduct,
    notes: notesText,
  };
}

/**
 * Formats a record into CustomerAppraisalSubmission
 */
export function formatCustomerSubmission(record: any): CustomerAppraisalSubmission {
  const { notesText, meta } = parseNotesMeta(record.appraiserNotes);
  const rawStatus = (record.status || 'PENDING').toLowerCase();
  const status =
    rawStatus === 'reviewed'
      ? 'reviewed'
      : rawStatus === 'approved'
      ? 'approved'
      : rawStatus === 'rejected'
      ? 'rejected'
      : 'pending';

  const images = record.images && Array.isArray(record.images) && record.images.length > 0 ? record.images : [];
  const customerNotes = meta.customerNotes || meta.notes || notesText || record.description || undefined;
  const appraiserNotes = meta.appraiserNotes || (notesText !== customerNotes ? notesText : undefined) || undefined;
  
  // Only surface codeInfo if it was provided by the customer or is a readable tag code (not internal DB key)
  const isInternalSubCode = record.appraisalCode?.startsWith('APPR-SUB-');
  const codeInfo = meta.codeInfo || (isInternalSubCode ? undefined : record.appraisalCode) || undefined;

  return {
    id: record.id,
    referenceId: `#${record.id}`,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    customerPhone: record.customerPhone || undefined,
    orderNumber: meta.orderNumber || undefined,
    productName: meta.productName || meta.sourceProduct || 'Surprise Reveal Candle',
    jewelryType: record.jewelryType || 'Ring',
    metalType: record.metalType || meta.metalType || undefined,
    gemstoneType: record.gemstoneType || meta.gemstoneType || undefined,
    codeInfo,
    photoPreviews: images,
    images,
    photos: images,
    status,
    notes: customerNotes,
    customerNotes,
    appraiserNotes,
    estimatedValue: record.estimatedValue ? Number(record.estimatedValue) : undefined,
    appraisedValue: record.appraisedValue ? Number(record.appraisedValue) : undefined,
    submittedAt: record.createdAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * List appraisals and customer submissions with statistics
 */
export async function listAdminAppraisals(query: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  tab?: string;
  section?: string;
}): Promise<{
  appraisals: JewelryAppraisal[];
  submissions: CustomerAppraisalSubmission[];
  items: any[];
  stats: AppraisalStatsResponse;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  await seedDefaultAppraisalsIfEmpty();

  const allRecords = await prisma.appraisal_records.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const certificateRecords: JewelryAppraisal[] = [];
  const submissionRecords: CustomerAppraisalSubmission[] = [];

  for (const r of allRecords) {
    const { meta } = parseNotesMeta(r.appraiserNotes);
    const isSub =
      meta.isSubmission === true ||
      ['SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'].includes(r.status.toUpperCase());

    if (isSub && meta.isCertificate !== true) {
      submissionRecords.push(formatCustomerSubmission(r));
    } else {
      certificateRecords.push(formatJewelryAppraisal(r));
    }
  }

  // Calculate statistics for Tab 1 (Submissions)
  const totalSubmissions = submissionRecords.length;
  const pendingReview = submissionRecords.filter((s) => s.status === 'pending').length;
  const reviewedSubmissions = submissionRecords.filter((s) => s.status === 'reviewed').length;
  const approvedAppraisals = submissionRecords.filter((s) => s.status === 'approved').length;

  // Calculate statistics for Tab 2 (Certificates)
  const activeCertificates = certificateRecords.filter((c) => c.status === 'active');
  const registeredCodes = activeCertificates.length;
  const totalAppraisedValuePool = activeCertificates.reduce((acc, c) => acc + c.estimatedValue, 0);
  const averageItemValue = registeredCodes > 0 ? Number((totalAppraisedValuePool / registeredCodes).toFixed(2)) : 0;

  const stats: AppraisalStatsResponse = {
    submissions: {
      totalSubmissions,
      pendingReview,
      reviewedSubmissions,
      approvedAppraisals,
    },
    certificates: {
      registeredCodes,
      totalAppraisedValuePool: Number(totalAppraisedValuePool.toFixed(2)),
      averageItemValue,
      customerPortalRoute: '/appraise-your-jewelry',
      valueRange: '$35 to $7,500 Range',
    },
  };

  // Filter based on active section/tab
  const activeTab = (query.tab || query.section || 'certificates').toLowerCase();
  let targetList: any[] = activeTab === 'submissions' ? submissionRecords : certificateRecords;

  if (query.search) {
    const s = query.search.toLowerCase().trim();
    const cleanS = s.replace(/^#/, '');
    if (activeTab === 'submissions') {
      targetList = targetList.filter(
        (item: CustomerAppraisalSubmission) =>
          item.id.toLowerCase().includes(s) ||
          item.id.toLowerCase().includes(cleanS) ||
          (item.referenceId && item.referenceId.toLowerCase().includes(s)) ||
          item.customerName.toLowerCase().includes(s) ||
          item.customerEmail.toLowerCase().includes(s) ||
          (item.customerPhone && item.customerPhone.toLowerCase().includes(s)) ||
          (item.productName && item.productName.toLowerCase().includes(s)) ||
          (item.jewelryType && item.jewelryType.toLowerCase().includes(s)) ||
          (item.orderNumber && item.orderNumber.toLowerCase().includes(cleanS)) ||
          (item.codeInfo && item.codeInfo.toLowerCase().includes(s))
      );
    } else {
      targetList = targetList.filter(
        (item: JewelryAppraisal) =>
          item.code.toLowerCase().includes(s) ||
          item.name.toLowerCase().includes(s) ||
          item.material.toLowerCase().includes(s) ||
          (item.stone && item.stone.toLowerCase().includes(s)) ||
          (item.orderNumber && item.orderNumber.toLowerCase().includes(cleanS)) ||
          (item.customerName && item.customerName.toLowerCase().includes(s))
      );
    }
  }

  if (query.type && query.type !== 'all') {
    const t = query.type.toLowerCase();
    targetList = targetList.filter((item: any) => (item.type || item.jewelryType || '').toLowerCase() === t);
  }

  if (query.status && query.status !== 'all') {
    const st = query.status.toLowerCase();
    targetList = targetList.filter((item: any) => item.status.toLowerCase() === st);
  }

  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 50));
  const skip = (page - 1) * limit;

  const total = targetList.length;
  const paginated = targetList.slice(skip, skip + limit);

  return {
    appraisals: activeTab === 'submissions' ? certificateRecords : paginated,
    submissions: activeTab === 'submissions' ? paginated : submissionRecords,
    items: paginated,
    stats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Create a new Jewelry Appraisal Code (Screenshot 4 Modal)
 */
export async function createAppraisal(data: CreateAppraisalDTO): Promise<JewelryAppraisal> {
  const code = normalizeCode(data.appraisalCode || data.code || '');
  if (!code) {
    const err: any = new Error('Appraisal code is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.appraisal_records.findUnique({
    where: { appraisalCode: code },
  });
  if (existing) {
    const err: any = new Error(`Appraisal code "${code}" is already registered`);
    err.statusCode = 400;
    throw err;
  }

  const estimatedValue = Number(data.estimatedValue ?? data.appraisedValue ?? 0);
  const appraisedValue = Number(data.appraisedValue ?? data.estimatedValue ?? 0);
  const jewelryName = data.jewelryName || data.name || `${data.jewelryType || 'Ring'} Reveal Surprise`;
  const jewelryType = data.jewelryType || data.type || 'Ring';
  const metalType = data.metalType || data.material || 'Solid .925 Sterling Silver';
  const gemstoneType = data.gemstoneType || data.stone || 'AAA Cubic Zirconia';

  let images = data.images || [];
  if (images.length === 0) {
    if (data.jewelryImagePreset) images = [data.jewelryImagePreset];
    else if (data.image) images = [data.image];
    else images = ['/assets/ilovesurprises/appraisals/sterling-silver-halo-ring.jpg'];
  }

  const serialNumber = data.serialNumber || data.certificateNumber || `ILS-${code}-CERT`;
  const inspectedDate = data.inspectedDate || new Date().toISOString().split('T')[0];

  const meta = {
    jewelryName,
    name: jewelryName,
    material: metalType,
    stone: gemstoneType,
    cutSetting: data.cutSetting || 'Fine Artisan Setting',
    orderNumber: data.orderNumber || data.orderId,
    sourceProduct: data.sourceProduct || data.productName,
    serialNumber,
    inspectedDate,
    isCertificate: true,
    notes: data.notes || '',
  };

  const status = (data.status || 'active').toUpperCase() === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE';

  const record = await prisma.appraisal_records.create({
    data: {
      id: `appr-${Date.now()}-${crypto.randomUUID().substring(0, 6)}`,
      appraisalCode: code,
      customerName: data.customerName || 'Pre-minted Certificate',
      customerEmail: data.customerEmail || 'unclaimed@ilovesurprises.com',
      customerPhone: data.customerPhone || null,
      jewelryType,
      metalType,
      gemstoneType,
      description: data.artisanDescription || data.description || 'Handcrafted genuine fine jewelry surprise reveal.',
      images,
      estimatedValue,
      appraisedValue,
      appraiserNotes: JSON.stringify(meta),
      certificateNumber: serialNumber,
      status,
      appraisedAt: new Date(inspectedDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return formatJewelryAppraisal(record);
}

/**
 * Get appraisal by ID or Code
 */
export async function getAppraisalByIdOrCode(idOrCode: string): Promise<JewelryAppraisal> {
  const cleanId = (idOrCode || '').trim().replace(/^#/, '');
  const norm = normalizeCode(cleanId);
  const record = await prisma.appraisal_records.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { id: idOrCode },
        { appraisalCode: norm },
        { certificateNumber: cleanId },
        { certificateNumber: idOrCode },
      ],
    },
  });

  if (!record) {
    const err: any = new Error(`Appraisal with identifier "${idOrCode}" not found`);
    err.statusCode = 404;
    throw err;
  }

  return formatJewelryAppraisal(record);
}

/**
 * Get single customer submission by ID or Reference ID
 */
export async function getSubmissionById(idOrRef: string): Promise<CustomerAppraisalSubmission> {
  const cleanId = (idOrRef || '').trim().replace(/^#/, '');
  const norm = normalizeCode(cleanId);

  const record = await prisma.appraisal_records.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { id: idOrRef },
        { appraisalCode: norm },
        { certificateNumber: cleanId },
      ],
    },
  });

  if (!record) {
    const err: any = new Error(`Customer submission "${idOrRef}" not found`);
    err.statusCode = 404;
    throw err;
  }

  return formatCustomerSubmission(record);
}

/**
 * Get record as either Appraisal or Submission depending on its type
 */
export async function getAppraisalOrSubmissionById(idOrCode: string): Promise<{
  appraisal: JewelryAppraisal;
  submission?: CustomerAppraisalSubmission;
  isSubmission: boolean;
}> {
  const cleanId = (idOrCode || '').trim().replace(/^#/, '');
  const norm = normalizeCode(cleanId);
  const record = await prisma.appraisal_records.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { id: idOrCode },
        { appraisalCode: norm },
        { certificateNumber: cleanId },
        { certificateNumber: idOrCode },
      ],
    },
  });

  if (!record) {
    const err: any = new Error(`Record with identifier "${idOrCode}" not found`);
    err.statusCode = 404;
    throw err;
  }

  const { meta } = parseNotesMeta(record.appraiserNotes);
  const isSubmission =
    meta.isSubmission === true ||
    ['SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'].includes(record.status.toUpperCase());

  return {
    appraisal: formatJewelryAppraisal(record),
    submission: isSubmission ? formatCustomerSubmission(record) : undefined,
    isSubmission,
  };
}

/**
 * Update an appraisal code
 */
export async function updateAppraisal(id: string, data: UpdateAppraisalDTO): Promise<JewelryAppraisal> {
  const existing = await prisma.appraisal_records.findUnique({
    where: { id },
  });
  if (!existing) {
    const err: any = new Error('Appraisal record not found');
    err.statusCode = 404;
    throw err;
  }

  const { meta: oldMeta } = parseNotesMeta(existing.appraiserNotes);
  const newMeta = {
    ...oldMeta,
    ...(data.jewelryName !== undefined && { jewelryName: data.jewelryName, name: data.jewelryName }),
    ...(data.name !== undefined && { jewelryName: data.name, name: data.name }),
    ...(data.material !== undefined && { material: data.material }),
    ...(data.stone !== undefined && { stone: data.stone }),
    ...(data.cutSetting !== undefined && { cutSetting: data.cutSetting }),
    ...(data.orderNumber !== undefined && { orderNumber: data.orderNumber }),
    ...(data.sourceProduct !== undefined && { sourceProduct: data.sourceProduct }),
    ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
    ...(data.notes !== undefined && { notes: data.notes }),
  };

  const images = data.images ?? (data.jewelryImagePreset ? [data.jewelryImagePreset] : data.image ? [data.image] : undefined);

  const updated = await prisma.appraisal_records.update({
    where: { id },
    data: {
      ...(data.appraisalCode && { appraisalCode: normalizeCode(data.appraisalCode) }),
      ...(data.code && { appraisalCode: normalizeCode(data.code) }),
      ...(data.estimatedValue !== undefined && { estimatedValue: data.estimatedValue }),
      ...(data.appraisedValue !== undefined && { appraisedValue: data.appraisedValue }),
      ...(data.jewelryType && { jewelryType: data.jewelryType }),
      ...(data.type && { jewelryType: data.type }),
      ...(data.metalType && { metalType: data.metalType }),
      ...(data.material && { metalType: data.material }),
      ...(data.gemstoneType && { gemstoneType: data.gemstoneType }),
      ...(data.stone && { gemstoneType: data.stone }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.artisanDescription !== undefined && { description: data.artisanDescription }),
      ...(images !== undefined && { images }),
      ...(data.status && { status: data.status.toUpperCase() }),
      ...(data.customerName !== undefined && { customerName: data.customerName }),
      ...(data.customerEmail !== undefined && { customerEmail: data.customerEmail }),
      appraiserNotes: JSON.stringify(newMeta),
      updatedAt: new Date(),
    },
  });

  return formatJewelryAppraisal(updated);
}

/**
 * Delete an appraisal record
 */
export async function deleteAppraisal(id: string): Promise<void> {
  const existing = await prisma.appraisal_records.findUnique({
    where: { id },
  });
  if (!existing) {
    const err: any = new Error('Appraisal record not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.appraisal_records.delete({
    where: { id },
  });
}

/**
 * Clear records (For "Clear Records" button in Screenshot 2 & 3)
 */
export async function clearAppraisals(scope: 'all' | 'certificates' | 'submissions' = 'all'): Promise<{ count: number }> {
  if (scope === 'all') {
    const result = await prisma.appraisal_records.deleteMany({});
    return { count: result.count };
  }

  const allRecords = await prisma.appraisal_records.findMany();
  const idsToDelete: string[] = [];

  for (const r of allRecords) {
    const { meta } = parseNotesMeta(r.appraiserNotes);
    const isSub =
      meta.isSubmission === true ||
      ['SUBMITTED', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'].includes(r.status.toUpperCase());

    if (scope === 'submissions' && isSub) {
      idsToDelete.push(r.id);
    } else if (scope === 'certificates' && !isSub) {
      idsToDelete.push(r.id);
    }
  }

  const result = await prisma.appraisal_records.deleteMany({
    where: { id: { in: idsToDelete } },
  });

  return { count: result.count };
}

/**
 * Reset to default factory items
 */
export async function resetAppraisalsToDefaults(): Promise<void> {
  await prisma.appraisal_records.deleteMany({});
  await seedDefaultAppraisalsIfEmpty();
}

/**
 * Customer / Storefront: Submit jewelry item for appraisal
 */
export async function submitCustomerAppraisal(data: SubmitCustomerAppraisalDTO): Promise<CustomerAppraisalSubmission> {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const subId = `appr-sub-${Date.now()}-${randomSuffix}`;
  
  // Use unique generated database code to prevent any collision with certificate codes or duplicate tag codes
  const uniqueDbCode = subId.toUpperCase();

  const customerName = (data.customerName || data.name || data.fullName || 'Anonymous Customer').trim();
  const customerEmail = (data.customerEmail || data.email || '').trim().toLowerCase();
  const productName = (data.productName || data.product || data.sourceProduct || 'Surprise Reveal Candle').trim();
  const jewelryType = (data.jewelryType || data.type || 'Ring').trim();
  const orderNumber = (data.orderNumber || data.orderId || '').trim() || undefined;
  const rawCodeInfo = (data.codeInfo || data.appraisalCode || data.code || data.tagCode || '').trim() || undefined;
  const notes = (data.notes || data.description || '').trim();

  // Combine image sources and convert base64 data URLs if present
  let rawImages = data.images || data.photoPreviews || data.photos || [];
  if (!Array.isArray(rawImages)) rawImages = [rawImages];

  const images: string[] = [];
  for (const img of rawImages) {
    if (typeof img === 'string' && img.trim().length > 0) {
      if (img.startsWith('data:image/')) {
        try {
          const savedPath = await saveBase64Image(img);
          images.push(savedPath);
        } catch {
          images.push(img);
        }
      } else {
        images.push(img.trim());
      }
    }
  }

  const meta = {
    name: `${jewelryType} Reveal Submission`,
    productName,
    orderNumber,
    codeInfo: rawCodeInfo,
    customerNotes: notes,
    appraiserNotes: '',
    isSubmission: true,
    notes,
  };

  const record = await prisma.appraisal_records.create({
    data: {
      id: subId,
      appraisalCode: uniqueDbCode,
      customerName,
      customerEmail,
      customerPhone: data.customerPhone || data.phone || null,
      jewelryType,
      metalType: data.metalType || data.material || null,
      gemstoneType: data.gemstoneType || data.stone || null,
      description: notes || (orderNumber ? `Submission from order ${orderNumber}` : 'Customer appraisal submission'),
      images,
      estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : 0,
      appraisedValue: data.estimatedValue ? Number(data.estimatedValue) : 0,
      appraiserNotes: JSON.stringify(meta),
      certificateNumber: `SUB-CERT-${Date.now()}-${randomSuffix}`,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return formatCustomerSubmission(record);
}

/**
 * Admin: Update customer appraisal submission (valuation, gemologist review, status)
 */
export async function updateCustomerSubmission(id: string, data: UpdateCustomerSubmissionDTO): Promise<CustomerAppraisalSubmission> {
  const cleanId = (id || '').trim().replace(/^#/, '');
  const existing = await prisma.appraisal_records.findFirst({
    where: {
      OR: [{ id: cleanId }, { id }, { appraisalCode: normalizeCode(cleanId) }],
    },
  });
  if (!existing) {
    const err: any = new Error('Customer submission not found');
    err.statusCode = 404;
    throw err;
  }

  const { meta: oldMeta } = parseNotesMeta(existing.appraiserNotes);
  const appraiserNotes = data.appraiserNotes !== undefined ? data.appraiserNotes : oldMeta.appraiserNotes;
  const customerNotes = data.customerNotes !== undefined ? data.customerNotes : (oldMeta.customerNotes || oldMeta.notes || '');

  const newMeta = {
    ...oldMeta,
    appraiserNotes: appraiserNotes || '',
    customerNotes: customerNotes || '',
    notes: data.notes !== undefined ? data.notes : (appraiserNotes || customerNotes),
  };

  const status = data.status ? data.status.toUpperCase() : undefined;

  const updated = await prisma.appraisal_records.update({
    where: { id: existing.id },
    data: {
      ...(status && { status }),
      ...(data.estimatedValue !== undefined && { estimatedValue: data.estimatedValue }),
      ...(data.appraisedValue !== undefined && { appraisedValue: data.appraisedValue }),
      appraiserNotes: JSON.stringify(newMeta),
      updatedAt: new Date(),
    },
  });

  return formatCustomerSubmission(updated);
}

/**
 * Public Customer Lookup: Check appraisal certificate code or submission reference ID
 */
export async function lookupAppraisalCode(rawCode: string): Promise<AppraisalLookupResponse> {
  await seedDefaultAppraisalsIfEmpty();

  const cleanCode = normalizeCode(rawCode).replace(/^#/, '');
  if (!cleanCode) {
    return {
      success: false,
      error: 'Please enter your jewelry code to check its appraised value.',
    };
  }

  // 1. First look for active pre-minted certificate
  const matchedCert = await prisma.appraisal_records.findFirst({
    where: {
      OR: [
        { appraisalCode: cleanCode },
        { certificateNumber: cleanCode },
      ],
      status: { in: ['ACTIVE', 'active'] },
    },
  });

  if (matchedCert) {
    const item = formatJewelryAppraisal(matchedCert);
    return {
      success: true,
      data: {
        code: item.code,
        name: item.name,
        type: item.type,
        estimatedValue: item.estimatedValue,
        retailValue: item.retailValue,
        image: item.image,
        images: item.images,
        material: item.material,
        stone: item.stone,
        cutSetting: item.cutSetting,
        specsAndMaterials: item.specsAndMaterials,
        description: item.description,
        serialNumber: item.serialNumber,
        certificateNumber: item.certificateNumber,
        inspectedDate: item.inspectedDate,
      },
    };
  }

  // 2. Check if this is a submission reference ID (e.g. #appr-sub-... or appr-sub-...)
  const matchedSub = await prisma.appraisal_records.findFirst({
    where: {
      OR: [
        { id: cleanCode.toLowerCase() },
        { appraisalCode: cleanCode },
        { certificateNumber: cleanCode },
      ],
    },
  });

  if (matchedSub) {
    const sub = formatCustomerSubmission(matchedSub);
    const subStatus = sub.status.toUpperCase();
    const isApproved = subStatus === 'APPROVED';

    return {
      success: true,
      data: {
        code: `#${sub.id}`,
        name: `${sub.jewelryType} Submission (${sub.productName})`,
        type: (sub.jewelryType || 'Ring') as JewelryType,
        estimatedValue: sub.estimatedValue || 0,
        retailValue: sub.appraisedValue || sub.estimatedValue || 0,
        image: sub.images && sub.images.length > 0 ? sub.images[0] : '',
        images: sub.images || [],
        material: sub.metalType || 'Fine Jewelry',
        stone: sub.gemstoneType || 'Gemstone',
        cutSetting: isApproved ? 'Gemologist Verified' : 'In Gemologist Review',
        specsAndMaterials: `Status: ${sub.status.toUpperCase()} • Submitted: ${sub.submittedAt ? sub.submittedAt.split('T')[0] : 'Recently'}`,
        description: isApproved
          ? (sub.appraiserNotes || 'Official valuation issued by certified gemology team.')
          : 'Your jewelry appraisal submission is currently under review by our certified appraisal specialists.',
        serialNumber: sub.id,
        certificateNumber: `#${sub.id}`,
        inspectedDate: sub.submittedAt ? sub.submittedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      },
    };
  }

  return {
    success: false,
    error: "We couldn't find that jewelry code. Please check the code and try again.",
  };
}
