import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { EmployeeService } from '../../src/services/employee.service';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  try {
    await connectDatabase();
    const employeeService = new EmployeeService();

    switch (req.method) {
      case 'GET': {
        const limit = Math.min(Number(req.query.limit) || 100, 100);
        const skip = Number(req.query.skip) || 0;
        const search = req.query.search as string | undefined;

        const { records, total } = await employeeService.listEmployees(limit, skip, search);

        return res.status(200).json({
          success: true,
          data: records,
          total,
        });
      }

      case 'POST': {
        const { name, email, phone, avatarUrl, notes } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Employee name is required',
          });
        }

        const employee = await employeeService.createEmployee({
          name: name.trim(),
          email: email || null,
          phone: phone || null,
          avatarUrl: avatarUrl || null,
          notes: notes || null,
        });

        return res.status(201).json({
          success: true,
          data: employee,
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
        });
    }
  } catch (error) {
    console.error('Employee operation failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
