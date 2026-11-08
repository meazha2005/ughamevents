import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { current_password, new_password } = await req.json();

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const users = await query<any[]>(
      'SELECT password_hash FROM uc_events_users WHERE id = ?',
      [session.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Current password does not match' },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await query('UPDATE uc_events_users SET password_hash = ? WHERE id = ?', [newHash, session.id]);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
