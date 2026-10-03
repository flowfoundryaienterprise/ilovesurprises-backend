import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppraisalRecordDTO } from '../types/appraisal.types';

export class AppraisalService {
  private generateAppraisalCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'APR-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private formatRecord(rec: any): AppraisalRecordDTO {
    return {
      id: rec.id,
      appraisalCode: rec.appraisalCode,
      userId: rec.userId,
      customerName: rec.customerName,
      customerEmail: rec.customerEmail,
      customerPhone: rec.customerPhone,
      jewelryType: rec.jewelryType,
      metalType: rec.metalType,
      gemstoneType: rec.gemstoneType,
      description: rec.description,
      images: rec.images || [],
      estimatedValue: rec.estimatedValue ? Number(rec.estimatedValue) : null,
      appraisedValue: rec.appraisedValue ? Number(rec.appraisedValue) : null,
      appraiserNotes: rec.appraiserNotes,
      certificateNumber: rec.certificateNumber,
      status: rec.status,
      appraisedAt: rec.appraisedAt,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  }

  async createAppraisal(
    userId: string | null,
    data: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      jewelryType: string;
      metalType?: string;
      gemstoneType?: string;
      description?: string;
      images?: string[];
      estimatedValue?: number;
    }
  ): Promise<AppraisalRecordDTO> {
    let appraisalCode = this.generateAppraisalCode();
    // Ensure uniqueness
    while (await prisma.appraisalRecord.findUnique({ where: { appraisalCode } })) {
      appraisalCode = this.generateAppraisalCode();
    }

    const rec = await prisma.appraisalRecord.create({
      data: {
        appraisalCode,
        userId: userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        jewelryType: data.jewelryType,
        metalType: data.metalType || null,
        gemstoneType: data.gemstoneType || null,
        description: data.description || null,
        images: data.images || [],
        estimatedValue: data.estimatedValue || null,
        status: 'SUBMITTED',
      },
    });

    return this.formatRecord(rec);
  }

  async getCustomerAppraisals(userId: string): Promise<AppraisalRecordDTO[]> {
    const records = await prisma.appraisalRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.formatRecord(r));
  }

  async getAppraisalByCode(code: string): Promise<AppraisalRecordDTO | null> {
    const clean = code.trim().toUpperCase();
    const rec = await prisma.appraisalRecord.findFirst({
      where: {
        OR: [
          { appraisalCode: clean },
          { id: clean },
          { certificateNumber: clean },
        ],
      },
    });
    return rec ? this.formatRecord(rec) : null;
  }

  // Admin APIs
  async listAppraisalsAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ appraisals: AppraisalRecordDTO[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AppraisalRecordWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { appraisalCode: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { certificateNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.appraisalRecord.count({ where }),
      prisma.appraisalRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      appraisals: records.map((r) => this.formatRecord(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAppraisalAdmin(
    id: string,
    data: {
      appraisedValue?: number;
      appraiserNotes?: string;
      certificateNumber?: string;
      status: string;
    }
  ): Promise<AppraisalRecordDTO> {
    const existing = await prisma.appraisalRecord.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error('Appraisal record not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.appraisalRecord.update({
      where: { id },
      data: {
        appraisedValue: data.appraisedValue !== undefined ? data.appraisedValue : existing.appraisedValue,
        appraiserNotes: data.appraiserNotes !== undefined ? data.appraiserNotes : existing.appraiserNotes,
        certificateNumber: data.certificateNumber !== undefined ? data.certificateNumber : existing.certificateNumber,
        status: data.status,
        appraisedAt: data.status === 'APPRAISED' ? new Date() : existing.appraisedAt,
      },
    });

    // If user has notification, create notification
    if (updated.userId) {
      await prisma.userNotification.create({
        data: {
          userId: updated.userId,
          title: `Appraisal Update: ${updated.appraisalCode}`,
          message: `Your jewelry appraisal has been updated to status: ${data.status}.${
            data.appraisedValue ? ` Valuation: $${data.appraisedValue.toFixed(2)}.` : ''
          }`,
          type: 'APPRAISAL',
          actionUrl: `/appraise?code=${updated.appraisalCode}`,
        },
      });
    }

    return this.formatRecord(updated);
  }
}

export const appraisalService = new AppraisalService();
