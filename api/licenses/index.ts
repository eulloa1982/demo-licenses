import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { LicenseService } from '../../src/services/license.service';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 100);
  const skip = Math.max(parseInt(String(req.query.skip ?? '0'), 10), 0);

  try {
    await connectDatabase();
    const service = new LicenseService();
    const { records, total } = await service.listLicenses(limit, skip);

    res.status(200).json({ success: true, data: records, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
}
