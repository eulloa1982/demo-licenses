import ImageKit from 'imagekit';

let client: ImageKit | null = null;

function getClient(): ImageKit {
  if (client) return client;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('ImageKit environment variables are not set (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT)');
  }

  client = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return client;
}

export interface UploadResult {
  url: string;
  fileId: string;
}

export async function uploadLicenseImage(
  base64: string,
  mimeType: string,
  filename: string,
): Promise<UploadResult> {
  const dataUri = `data:${mimeType};base64,${base64}`;

  const result = await getClient().upload({
    file: dataUri,
    fileName: filename,
    folder: '/licenses',
    useUniqueFileName: true,
    tags: ['license', 'health'],
  });

  return { url: result.url, fileId: result.fileId };
}
