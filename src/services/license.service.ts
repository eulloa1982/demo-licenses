import { OcrService } from './ocr.service';
import { LicenseRepository } from '../repositories/license.repository';
import { uploadLicenseImage } from './imagekit.service';
import { parseLicenseText } from '../parsers/license.parser';
import { ScanLicenseRequest } from '../types/license.types';
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

  async listLicenses(
    limit: number,
    skip: number,
  ): Promise<{ records: LicenseDocument[]; total: number }> {
    return this.licenseRepository.findAll(limit, skip);
  }
}
