import { OcrService } from './ocr.service';
import { LicenseRepository } from '../repositories/license.repository';
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
    const rawText = await this.ocrService.extractText(
      request.image,
      request.mimeType ?? 'image/jpeg',
    );

    const parsedData = parseLicenseText(rawText);

    return this.licenseRepository.save({
      ...parsedData,
      imageBase64: request.image,
    });
  }

  async listLicenses(
    limit: number,
    skip: number,
  ): Promise<{ records: LicenseDocument[]; total: number }> {
    return this.licenseRepository.findAll(limit, skip);
  }
}
