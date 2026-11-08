import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

function saveBase64Image(dataUrl: string, subfolder: string = 'profiles'): string {
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return dataUrl;

    const mime = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const ext = extMap[mime] || '.jpg';
    const filename = `${subfolder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.warn('Failed to parse base64 image to file:', err);
    return dataUrl;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, college_name, password } = body;
    let { profile_pic } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query<any[]>(
      'SELECT id FROM uc_events_users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // If profile_pic is a base64 data-URL, convert it to a clean local file
    if (profile_pic && profile_pic.startsWith('data:image/')) {
      profile_pic = saveBase64Image(profile_pic, 'profiles');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result: any = await query(
      `INSERT INTO uc_events_users (name, email, phone, college_name, password_hash, profile_pic, role)
       VALUES (?, ?, ?, ?, ?, ?, 'student')`,
      [name.trim(), cleanEmail, phone.trim(), college_name || null, passwordHash, profile_pic || null]
    );

    const userSession = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      college_name: college_name || '',
      profile_pic: profile_pic || '',
      role: 'student' as const,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userSession,
      token,
    });

    response.cookies.set('uc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
