import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role === 'admin') {
      const admins = await query<any[]>(
        'SELECT id, name, email, role FROM uc_events_admin WHERE id = ?',
        [session.id]
      );
      if (admins.length === 0) {
        return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: { ...admins[0], role: 'admin' },
      });
    }

    const students = await query<any[]>(
      'SELECT id, name, email, phone, college_id, college_name, profile_pic, role, created_at FROM uc_events_users WHERE id = ?',
      [session.id]
    );

    if (students.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = students[0];

    // Also get events student is registered for
    const registrations = await query<any[]>(
      `SELECT r.id, r.event_id, r.status, r.registered_at,
              e.title as event_title, e.slug as event_slug, e.event_date, e.venue, e.mode, e.poster_url, e.category_name
       FROM uc_events_registrations r
       JOIN uc_events_events e ON r.event_id = e.id
       WHERE r.user_id = ? AND r.status = 'registered'
       ORDER BY r.registered_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user,
      registrations,
    });
  } catch (error: any) {
    console.error('Session me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
