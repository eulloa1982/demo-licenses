import mongoose, { Schema, Document } from 'mongoose';

export interface EmployeeDocument extends Document {
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

// Index for searching by name
EmployeeSchema.index({ name: 'text' });

// Prevent model recompilation in serverless warm restarts
export const EmployeeModel =
  (mongoose.models.Employee as mongoose.Model<EmployeeDocument>) ||
  mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);
