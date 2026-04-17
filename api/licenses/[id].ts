import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { LicenseService } from '../../src/services/license.service';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'License ID is required' });
  }

  try {
    await connectDatabase();
    const licenseService = new LicenseService();

    switch (req.method) {
      case 'GET': {
        const license = await licenseService.getLicenseById(id);
        if (!license) {
          return res.status(404).json({ success: false, error: 'License not found' });
        }
        return res.status(200).json({ success: true, data: license });
      }

      case 'PUT': {
        const updateData = req.body;
        if (!updateData || Object.keys(updateData).length === 0) {
          return res.status(400).json({ success: false, error: 'Update data is required' });
        }

        const updated = await licenseService.updateLicense(id, updateData);
        if (!updated) {
          return res.status(404).json({ success: false, error: 'License not found' });
        }
        return res.status(200).json({ success: true, data: updated });
      }

      case 'DELETE': {
        const deleted = await licenseService.deleteLicense(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'License not found' });
        }
        return res.status(200).json({ success: true, message: 'License deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('License operation failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
