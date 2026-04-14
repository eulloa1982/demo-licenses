import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { LicenseService } from '../../src/services/license.service';
import { ScanLicenseRequest } from '../../src/types/license.types';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const body = req.body as Partial<ScanLicenseRequest>;
  const { image, filename, mimeType } = body ?? {};

  if (!image || typeof image !== 'string') {
    res.status(400).json({ success: false, error: 'Field "image" (base64 string) is required' });
    return;
  }

  try {
    await connectDatabase();
    const service = new LicenseService();
    const result = await service.scanAndSave({ image, filename, mimeType });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
}
