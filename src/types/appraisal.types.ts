export interface AppraisalRecordDTO {
  id: string;
  appraisalCode: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  jewelryType: string;
  metalType: string | null;
  gemstoneType: string | null;
  description: string | null;
  images: string[];
  estimatedValue: number | null;
  appraisedValue: number | null;
  appraiserNotes: string | null;
  certificateNumber: string | null;
  status: string;
  appraisedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
