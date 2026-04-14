import axios from 'axios';
import FormData from 'form-data';

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

export interface UploadResult {
  url: string;
  fileId: string;
}

export async function uploadLicenseImage(
  base64: string,
  mimeType: string,
  filename: string,
): Promise<UploadResult> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY environment variable is not set');

  const form = new FormData();
  form.append('file', `data:${mimeType};base64,${base64}`);
  form.append('fileName', filename);
  form.append('folder', '/licenses');
  form.append('useUniqueFileName', 'true');
  form.append('tags', 'license,health');

  // ImageKit Upload API uses HTTP Basic Auth: privateKey as username, empty password
  const credentials = Buffer.from(`${privateKey}:`).toString('base64');

  const response = await axios.post<{ url: string; fileId: string }>(
    IMAGEKIT_UPLOAD_URL,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Basic ${credentials}`,
      },
      timeout: 30_000,
    },
  ).catch(err => {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`ImageKit upload failed (${err.response?.status ?? 'network'}): ${detail}`);
  });

  return { url: response.data.url, fileId: response.data.fileId };
}
