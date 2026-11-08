import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, college_name, profile_pic } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE uc_events_users 
       SET name = ?, phone = ?, college_name = ?, profile_pic = COALESCE(?, profile_pic)
       WHERE id = ?`,
      [name.trim(), phone.trim(), college_name || null, profile_pic || null, session.id]
    );

    // Fetch updated user
    const users = await query<any[]>(
      'SELECT id, name, email, phone, college_name, profile_pic, role FROM uc_events_users WHERE id = ?',
      [session.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0],
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
