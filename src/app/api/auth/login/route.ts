import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check student account
    const users = await query<any[]>(
      'SELECT id, name, email, phone, college_name, profile_pic, password_hash, role FROM uc_events_users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      college_name: user.college_name || '',
      profile_pic: user.profile_pic || '',
      role: 'student' as const,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
