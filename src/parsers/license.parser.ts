import { LicenseData } from '../types/license.types';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

const LICENSE_TYPE_KEYWORDS = [
  'Registered Nurse', 'Licensed Practical Nurse', 'Nurse Practitioner',
  'Physical Therapist', 'Occupational Therapist', 'Respiratory Therapist',
  'Medical Doctor', 'Physician Assistant', 'Pharmacist', 'Dentist',
  'Radiologic Technologist', 'Clinical Social Worker', 'Psychologist',
  'Paramedic', 'Emergency Medical Technician', 'EMT', 'RN', 'LPN', 'NP',
  'PT', 'OT', 'RT', 'MD', 'DO', 'PA',
];

function extractLicenseNumber(text: string): string | null {
  const patterns = [
    /license\s*(?:number|no\.?|#)?\s*:?\s*([A-Z0-9\-]{5,20})/i,
    /lic\.?\s*#?\s*:?\s*([A-Z0-9\-]{5,20})/i,
    /certificate\s*(?:number|no\.?|#)?\s*:?\s*([A-Z0-9\-]{5,20})/i,
    /\b([A-Z]{1,3}-?\d{5,10})\b/,
    /\b(\d{6,12})\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function extractDates(text: string): { issueDate: string | null; expirationDate: string | null } {
  const issuePattern = /(?:issue|issued|effective|date\s+of\s+issue)[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
  const expiryPattern = /(?:expir|expires|expiration|valid\s+through|valid\s+until)[^\d]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;

  const issueMatch = text.match(issuePattern);
  const expiryMatch = text.match(expiryPattern);

  // Fallback: grab the first two dates if no labelled dates found
  const allDates = [...text.matchAll(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g)].map(m => m[1]);

  return {
    issueDate: issueMatch?.[1] ?? allDates[0] ?? null,
    expirationDate: expiryMatch?.[1] ?? allDates[1] ?? null,
  };
}

// A valid name: 2-4 words, each Title-cased, no digits, no all-caps words.
const NAME_RE = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/;

function isValidName(candidate: string): boolean {
  return NAME_RE.test(candidate.trim());
}

function extractHolderName(text: string): string | null {
  // Priority 1: explicit "Name:" label — capture only up to the next tab or newline.
  const nameLabel = text.match(/\bName\s*:\s*([^\t\r\n]+)/i);
  if (nameLabel) {
    const candidate = nameLabel[1].trim();
    if (isValidName(candidate)) return candidate;
  }

  // Priority 2: certification phrases — must end with ":" to avoid matching
  // mid-sentence phrases like "LICENSE TO PRACTICE".
  const certMatch = text.match(
    /(?:this\s+certifies?\s+that|issued\s+to|awarded\s+to)\s*:?\s*([^\t\r\n]+)/i,
  );
  if (certMatch) {
    const candidate = certMatch[1].trim();
    if (isValidName(candidate)) return candidate;
  }

  // Priority 3: a line that is itself nothing but a proper name.
  for (const line of text.split(/[\r\n]+/)) {
    const trimmed = line.replace(/\t/g, ' ').trim();
    if (isValidName(trimmed)) return trimmed;
  }

  return null;
}

function extractLicenseType(text: string): string | null {
  for (const keyword of LICENSE_TYPE_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(text)) return keyword;
  }
  return null;
}

function extractState(text: string): string | null {
  const stateOfMatch = text.match(/\bState\s+of\s+([A-Z][a-zA-Z\s]+?)(?:\n|,|$)/i);
  if (stateOfMatch) return stateOfMatch[1].trim();

  for (const state of US_STATES) {
    if (new RegExp(`\\b${state}\\b`, 'i').test(text)) return state;
  }
  return null;
}

function extractCreditHours(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:CEU|credit\s+hour|contact\s+hour|CE\s+hour)/i);
  if (!match) return null;
  const hours = parseFloat(match[1]);
  // Single-course credits are typically 0.25–50. Values above 100 likely
  // indicate an OCR decimal-point miss (e.g. "4.0" read as "40").
  return hours <= 100 ? hours : hours / 10;
}

function extractCourseTitle(text: string): string | null {
  const patterns = [
    /(?:course|program|training)\s*(?:title|name)?\s*:\s*(.+?)(?:\n|$)/i,
    /(?:completion\s+of|has\s+completed)\s+(.+?)(?:\n|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

export function parseLicenseText(rawText: string): LicenseData {
  const { issueDate, expirationDate } = extractDates(rawText);
  return {
    holderName: extractHolderName(rawText),
    licenseNumber: extractLicenseNumber(rawText),
    licenseType: extractLicenseType(rawText),
    issuingState: extractState(rawText),
    issueDate,
    expirationDate,
    courseTitle: extractCourseTitle(rawText),
    creditHours: extractCreditHours(rawText),
    rawText,
  };
}
