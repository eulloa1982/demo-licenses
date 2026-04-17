import { OcrService } from './ocr.service';
import { LicenseRepository } from '../repositories/license.repository';
import { uploadLicenseImage } from './imagekit.service';
import { parseLicenseText } from '../parsers/license.parser';
import { ScanLicenseRequest, PreviewResult, SaveLicenseRequest } from '../types/license.types';
import { LicenseDocument } from '../models/license.model';

export class LicenseService {
  private readonly ocrService: OcrService;
  private readonly licenseRepository: LicenseRepository;

  constructor() {
    this.ocrService = new OcrService();
    this.licenseRepository = new LicenseRepository();
  }

  async scanAndSave(request: ScanLicenseRequest): Promise<LicenseDocument> {
    const mimeType = request.mimeType ?? 'image/jpeg';
    const filename = request.filename ?? `license-${Date.now()}.jpg`;

    // Run OCR and image upload concurrently
    const [rawText, imageUpload] = await Promise.all([
      this.ocrService.extractText(request.image, mimeType),
      uploadLicenseImage(request.image, mimeType, filename),
    ]);

    const parsedData = parseLicenseText(rawText);

    return this.licenseRepository.save({
      ...parsedData,
      imageUrl: imageUpload.url,
      imagekitFileId: imageUpload.fileId,
    });
  }

  async preview(request: ScanLicenseRequest): Promise<PreviewResult> {
    const mimeType = request.mimeType ?? 'image/jpeg';
    const filename = request.filename ?? `license-${Date.now()}.jpg`;

    // Run OCR and image upload concurrently
    const [rawText, imageUpload] = await Promise.all([
      this.ocrService.extractText(request.image, mimeType),
      uploadLicenseImage(request.image, mimeType, filename),
    ]);

    const parsedData = parseLicenseText(rawText);

    return {
      parsedData,
      imageUrl: imageUpload.url,
      imagekitFileId: imageUpload.fileId,
    };
  }

  async saveLicense(data: SaveLicenseRequest): Promise<LicenseDocument> {
    return this.licenseRepository.save({
      holderName: data.holderName,
      licenseNumber: data.licenseNumber,
      licenseType: data.licenseType,
      issuingState: data.issuingState,
      issueDate: data.issueDate,
      expirationDate: data.expirationDate,
      courseTitle: data.courseTitle,
      creditHours: data.creditHours,
      rawText: data.rawText,
      imageUrl: data.imageUrl,
      imagekitFileId: data.imagekitFileId,
    });
  }

  async listLicenses(
    limit: number,
    skip: number,
    filters: import('../types/license.types').LicenseFilters = {},
  ): Promise<{ records: LicenseDocument[]; total: number }> {
    return this.licenseRepository.findAll(limit, skip, filters);
  }

  async getLicenseById(id: string): Promise<LicenseDocument | null> {
    return this.licenseRepository.findById(id);
  }

  async updateLicense(
    id: string,
    data: Partial<SaveLicenseRequest>,
  ): Promise<LicenseDocument | null> {
    return this.licenseRepository.update(id, data);
  }

  async deleteLicense(id: string): Promise<boolean> {
    return this.licenseRepository.delete(id);
  }
}
