import { EmployeeModel, EmployeeDocument } from '../models/employee.model';

export interface CreateEmployeeData {
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  notes?: string | null;
}

export class EmployeeRepository {
  async create(data: CreateEmployeeData): Promise<EmployeeDocument> {
    const employee = new EmployeeModel(data);
    return employee.save();
  }

  async findAll(
    limit: number = 100,
    skip: number = 0,
    search?: string,
  ): Promise<{ records: EmployeeDocument[]; total: number }> {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [records, total] = await Promise.all([
      EmployeeModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean<EmployeeDocument[]>(),
      EmployeeModel.countDocuments(query),
    ]);

    return { records, total };
  }

  async findById(id: string): Promise<EmployeeDocument | null> {
    return EmployeeModel.findById(id).lean<EmployeeDocument>();
  }

  async findByName(name: string): Promise<EmployeeDocument | null> {
    return EmployeeModel.findOne({ name: { $regex: `^${name}$`, $options: 'i' } }).lean<EmployeeDocument>();
  }

  async update(id: string, data: Partial<CreateEmployeeData>): Promise<EmployeeDocument | null> {
    return EmployeeModel.findByIdAndUpdate(id, data, { new: true }).lean<EmployeeDocument>();
  }

  async delete(id: string): Promise<boolean> {
    const result = await EmployeeModel.findByIdAndDelete(id);
    return result !== null;
  }
}
