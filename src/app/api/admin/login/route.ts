import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

// Rate limiting to protect admin login from brute force attacks
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const attemptsMap = new Map<string, { count: number; lockoutUntil: number }>();

function getClientIdentifier(req: NextRequest, email: string): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
  return `${ip}_${email.toLowerCase().trim()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const identifier = getClientIdentifier(req, cleanEmail);
    const now = Date.now();

    // Check rate limit
    const record = attemptsMap.get(identifier);
    if (record && record.count >= MAX_ATTEMPTS && now < record.lockoutUntil) {
      const remainingMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Account temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    const admins = await query<any[]>(
      'SELECT id, name, email, password_hash, role FROM uc_events_admin WHERE email = ?',
      [cleanEmail]
    );

    if (admins.length === 0) {
      // Record failed attempt
      const prev = attemptsMap.get(identifier);
      const count = prev ? prev.count + 1 : 1;
      attemptsMap.set(identifier, {
        count,
        lockoutUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      const prev = attemptsMap.get(identifier);
      const count = prev ? prev.count + 1 : 1;
      attemptsMap.set(identifier, {
        count,
        lockoutUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Successful authentication: clear attempts
    attemptsMap.delete(identifier);

    const adminSession = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin' as const,
    };

    const token = signToken(adminSession);

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      admin: adminSession,
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
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again later.' },
      { status: 500 }
    );
  }
}
