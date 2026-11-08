import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [usersCount]: any = await query('SELECT COUNT(*) as count FROM uc_events_users');
    const [eventsCount]: any = await query('SELECT COUNT(*) as count FROM uc_events_events');
    const [collegesCount]: any = await query('SELECT COUNT(*) as count FROM uc_events_colleges');
    const [registrationsCount]: any = await query(
      "SELECT COUNT(*) as count FROM uc_events_registrations WHERE status = 'registered'"
    );

    const recentSignups = await query<any[]>(
      'SELECT id, name, email, phone, college_name, profile_pic, created_at FROM uc_events_users ORDER BY created_at DESC LIMIT 6'
    );

    const recentRegistrations = await query<any[]>(
      `SELECT r.id, r.user_name, r.user_email, r.user_college, r.registered_at, e.title as event_title
       FROM uc_events_registrations r
       JOIN uc_events_events e ON r.event_id = e.id
       ORDER BY r.registered_at DESC LIMIT 6`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalSignups: usersCount.count,
        totalEvents: eventsCount.count,
        totalColleges: collegesCount.count,
        totalRegistrations: registrationsCount.count,
      },
      recentSignups,
      recentRegistrations,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
