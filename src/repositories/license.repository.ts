import { LicenseModel, LicenseDocument } from '../models/license.model';
import { LicenseData, LicenseFilters } from '../types/license.types';

function buildQuery(filters: LicenseFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filters.holderName) {
    query.holderName = { $regex: filters.holderName, $options: 'i' };
  }
  if (filters.licenseNumber) {
    query.licenseNumber = { $regex: filters.licenseNumber, $options: 'i' };
  }
  if (filters.licenseType) {
    query.licenseType = { $regex: filters.licenseType, $options: 'i' };
  }
  if (filters.expirationDate) {
    query.expirationDate = filters.expirationDate;
  }
  if (filters.rawText) {
    query.rawText = { $regex: filters.rawText, $options: 'i' };
  }

  return query;
}

export class LicenseRepository {
  async save(data: LicenseData & { imageUrl?: string; imagekitFileId?: string }): Promise<LicenseDocument> {
    const license = new LicenseModel(data);
    return license.save();
  }

  async findAll(
    limit: number,
    skip: number,
    filters: LicenseFilters = {},
  ): Promise<{ records: LicenseDocument[]; total: number }> {
    const query = buildQuery(filters);

    const [records, total] = await Promise.all([
      LicenseModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<LicenseDocument[]>(),
      LicenseModel.countDocuments(query),
    ]);

    return { records, total };
  }

  async findById(id: string): Promise<LicenseDocument | null> {
    return LicenseModel.findById(id).lean<LicenseDocument>();
  }

  async update(
    id: string,
    data: Partial<LicenseData & { imageUrl?: string; imagekitFileId?: string }>,
  ): Promise<LicenseDocument | null> {
    return LicenseModel.findByIdAndUpdate(id, data, { new: true }).lean<LicenseDocument>();
  }

  async delete(id: string): Promise<boolean> {
    const result = await LicenseModel.findByIdAndDelete(id);
    return result !== null;
  }
}
