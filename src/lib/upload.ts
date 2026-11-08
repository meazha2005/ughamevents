export async function uploadImageToPhpBackend(
  file: File,
  type: 'events' | 'profiles' | 'general' = 'general'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const phpUrl = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || 'https://ztoitech.com/events/uc/upload.php';

  // 1. Try Direct upload to PHP backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(phpUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Direct PHP upload attempted, falling back to Next.js API proxy:', err);
  }

  // 2. Via Next.js upload proxy API (which saves to local public/uploads/ if PHP is unavailable)
  try {
    const proxyRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData.success && proxyData.url) {
        return proxyData.url;
      }
    }
    const errData = await proxyRes.json();
    throw new Error(errData.error || 'Failed to upload image');
  } catch (err: any) {
    console.error('Upload proxy error:', err);
    throw new Error(err.message || 'Image upload failed. Please try again.');
  }
}
