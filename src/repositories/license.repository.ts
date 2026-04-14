import { LicenseModel, LicenseDocument } from '../models/license.model';
import { LicenseData } from '../types/license.types';

export class LicenseRepository {
  async save(data: LicenseData & { imageBase64?: string }): Promise<LicenseDocument> {
    const license = new LicenseModel(data);
    return license.save();
  }

  async findAll(
    limit: number,
    skip: number,
  ): Promise<{ records: LicenseDocument[]; total: number }> {
    const [records, total] = await Promise.all([
      LicenseModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<LicenseDocument[]>(),
      LicenseModel.countDocuments(),
    ]);
    return { records, total };
  }

  async findById(id: string): Promise<LicenseDocument | null> {
    return LicenseModel.findById(id).lean<LicenseDocument>();
  }
}
