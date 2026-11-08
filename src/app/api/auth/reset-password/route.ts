import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP code, and new password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Check valid active OTP
    const otps = await query<any[]>(
      `SELECT id, otp_code, expires_at FROM uc_events_otp 
       WHERE email = ? AND purpose = 'password_reset' AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [cleanEmail]
    );

    if (otps.length === 0 || otps[0].otp_code !== cleanOtp) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP code. Please request a new one.' },
        { status: 400 }
      );
    }

    const matchedOtp = otps[0];

    // Mark OTP as used
    await query('UPDATE uc_events_otp SET used = 1 WHERE id = ?', [matchedOtp.id]);

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      'UPDATE uc_events_users SET password_hash = ? WHERE email = ?',
      [passwordHash, cleanEmail]
    );

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset! You can now sign in.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
