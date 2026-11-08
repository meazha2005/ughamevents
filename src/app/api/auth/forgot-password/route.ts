import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPasswordResetOtpEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify user exists in student database
    const users = await query<any[]>(
      'SELECT id, name FROM uc_events_users WHERE email = ?',
      [cleanEmail]
    );

    if (users.length === 0) {
      // For security, don't leak user existence or return informative message
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Invalidate previous active OTPs for this email
    await query(
      `UPDATE uc_events_otp SET used = 1 WHERE email = ? AND purpose = 'password_reset' AND used = 0`,
      [cleanEmail]
    );

    // Generate random 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiry: 10 minutes from now (formatted for MySQL DATETIME)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await query(
      `INSERT INTO uc_events_otp (email, otp_code, purpose, expires_at, used) VALUES (?, ?, 'password_reset', ?, 0)`,
      [cleanEmail, otpCode, expiresAt]
    );

    // Send email using Gmail SMTP
    try {
      await sendPasswordResetOtpEmail(cleanEmail, otpCode, user.name);
    } catch (mailError: any) {
      console.error('Failed to send email via SMTP:', mailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email: ' + (mailError.message || 'SMTP service error') },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP has been sent to your email address.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing request' },
      { status: 500 }
    );
  }
}
