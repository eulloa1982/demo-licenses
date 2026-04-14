import axios from 'axios';
import FormData from 'form-data';
import { OcrSpaceResponse } from '../types/ocr.types';

const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';

export class OcrService {
  private readonly apiKey: string;

  constructor() {
    const key = process.env.OCR_SPACE_API_KEY;
    if (!key) throw new Error('OCR_SPACE_API_KEY environment variable is not set');
    this.apiKey = key;
  }

  async extractText(imageBase64: string, mimeType = 'image/jpeg'): Promise<string> {
    const form = new FormData();
    form.append('apikey', this.apiKey);
    form.append('base64Image', `data:${mimeType};base64,${imageBase64}`);
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('isTable', 'true');
    form.append('scale', 'true');

    const response = await axios.post<OcrSpaceResponse>(OCR_SPACE_API_URL, form, {
      headers: form.getHeaders(),
      timeout: 30_000,
    });

    const result = response.data;

    if (result.IsErroredOnProcessing) {
      const msg = result.ParsedResults?.[0]?.ErrorMessage ?? 'Unknown OCR error';
      throw new Error(`OCR processing failed: ${msg}`);
    }

    if (!result.ParsedResults?.length) {
      throw new Error('No results returned from OCR service');
    }

    return result.ParsedResults[0].ParsedText ?? '';
  }
}
