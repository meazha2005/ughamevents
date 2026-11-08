import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const phpEndpoint = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || 'https://ztoitech.com/events/uc/upload.php';

    // 1. Try forwarding to remote PHP backend
    try {
      const phpFormData = new FormData();
      phpFormData.append('file', file);
      phpFormData.append('type', type);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const phpRes = await fetch(phpEndpoint, {
        method: 'POST',
        body: phpFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (phpRes.ok) {
        const phpData = await phpRes.json();
        if (phpData.success && phpData.url) {
          return NextResponse.json(phpData);
        }
      }
    } catch (phpErr: any) {
      console.warn('PHP upload attempt notice:', phpErr?.message || phpErr);
    }

    // 2. High-performance Local fallback: save file directly to public/uploads/
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize type
    const safeType = type.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeType);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalExt = path.extname(file.name) || '.jpg';
    const uniqueFilename = `${safeType}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${originalExt}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);

    await fs.promises.writeFile(destinationPath, buffer);

    const localUrl = `/uploads/${safeType}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      filename: uniqueFilename,
      type: safeType,
      message: 'Image uploaded and stored successfully.',
    });
  } catch (error: any) {
    console.error('Upload proxy error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
