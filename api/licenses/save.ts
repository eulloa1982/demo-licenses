import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { LicenseService } from '../../src/services/license.service';
import { SaveLicenseRequest } from '../../src/types/license.types';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = req.body as Partial<SaveLicenseRequest>;

  if (!body.rawText || !body.imageUrl) {
    res.status(400).json({
      success: false,
      error: 'Fields "rawText" and "imageUrl" are required'
    });
    return;
  }

  try {
    await connectDatabase();
    const service = new LicenseService();
    const result = await service.saveLicense({
      holderName: body.holderName ?? null,
      licenseNumber: body.licenseNumber ?? null,
      licenseType: body.licenseType ?? null,
      issuingState: body.issuingState ?? null,
      issueDate: body.issueDate ?? null,
      expirationDate: body.expirationDate ?? null,
      courseTitle: body.courseTitle ?? null,
      creditHours: body.creditHours ?? null,
      rawText: body.rawText,
      imageUrl: body.imageUrl,
      imagekitFileId: body.imagekitFileId ?? '',
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
}
