import { EmployeeRepository, CreateEmployeeData } from '../repositories/employee.repository';
import { EmployeeDocument } from '../models/employee.model';

export class EmployeeService {
  private readonly employeeRepository: EmployeeRepository;

  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  async createEmployee(data: CreateEmployeeData): Promise<EmployeeDocument> {
    return this.employeeRepository.create(data);
  }

  async listEmployees(
    limit: number = 100,
    skip: number = 0,
    search?: string,
  ): Promise<{ records: EmployeeDocument[]; total: number }> {
    return this.employeeRepository.findAll(limit, skip, search);
  }

  async getEmployeeById(id: string): Promise<EmployeeDocument | null> {
    return this.employeeRepository.findById(id);
  }

  async getEmployeeByName(name: string): Promise<EmployeeDocument | null> {
    return this.employeeRepository.findByName(name);
  }

  async updateEmployee(id: string, data: Partial<CreateEmployeeData>): Promise<EmployeeDocument | null> {
    return this.employeeRepository.update(id, data);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employeeRepository.delete(id);
  }
}
