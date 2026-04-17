import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../../src/config/database';
import { EmployeeService } from '../../src/services/employee.service';
import { handlePreflight, setCorsHeaders } from '../../src/utils/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (handlePreflight(req, res)) return;
  setCorsHeaders(req, res);

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Employee ID is required' });
  }

  try {
    await connectDatabase();
    const employeeService = new EmployeeService();

    switch (req.method) {
      case 'GET': {
        const employee = await employeeService.getEmployeeById(id);
        if (!employee) {
          return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        return res.status(200).json({ success: true, data: employee });
      }

      case 'PUT': {
        const updateData = req.body;
        if (!updateData || Object.keys(updateData).length === 0) {
          return res.status(400).json({ success: false, error: 'Update data is required' });
        }

        const updated = await employeeService.updateEmployee(id, updateData);
        if (!updated) {
          return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        return res.status(200).json({ success: true, data: updated });
      }

      case 'DELETE': {
        const deleted = await employeeService.deleteEmployee(id);
        if (!deleted) {
          return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Employee operation failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    });
  }
}
