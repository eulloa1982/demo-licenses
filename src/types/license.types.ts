export interface LicenseData {
  holderName: string | null;
  licenseNumber: string | null;
  licenseType: string | null;
  issuingState: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  courseTitle: string | null;
  creditHours: number | null;
  rawText: string;
}

export interface ScanLicenseRequest {
  image: string; // base64 encoded
  filename?: string;
  mimeType?: string;
}
