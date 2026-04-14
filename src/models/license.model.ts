import mongoose, { Schema, Document } from 'mongoose';
import { LicenseData } from '../types/license.types';

export interface LicenseDocument extends LicenseData, Document {
  imageBase64?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LicenseSchema = new Schema<LicenseDocument>(
  {
    holderName: { type: String, default: null },
    licenseNumber: { type: String, default: null },
    licenseType: { type: String, default: null },
    issuingState: { type: String, default: null },
    issueDate: { type: String, default: null },
    expirationDate: { type: String, default: null },
    courseTitle: { type: String, default: null },
    creditHours: { type: Number, default: null },
    rawText: { type: String, required: true },
    imageBase64: { type: String, select: false }, // excluded from default queries
  },
  { timestamps: true },
);

// Prevent model recompilation in serverless warm restarts
export const LicenseModel =
  (mongoose.models.License as mongoose.Model<LicenseDocument>) ||
  mongoose.model<LicenseDocument>('License', LicenseSchema);
