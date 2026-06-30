// Storage abstraction layer
// In production, replace with Vercel Blob or S3

const storage = new Map<string, { buffer: Buffer; contentType: string }>();

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `pipeline/${Date.now()}-${filename}`;
  storage.set(key, { buffer, contentType });

  // In production: return Vercel Blob URL
  // For now, return a placeholder URL
  return `https://storage.example.com/${key}`;
}

export async function uploadFromUrl(
  url: string,
  filename: string
): Promise<string> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  return uploadBuffer(buffer, filename, contentType);
}

export async function getBuffer(url: string): Promise<Buffer | null> {
  // Check if it's a storage URL
  if (url.startsWith('https://storage.example.com/')) {
    const key = url.replace('https://storage.example.com/', '');
    const item = storage.get(key);
    return item?.buffer || null;
  }

  // Otherwise fetch from external URL
  const response = await fetch(url);
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}
