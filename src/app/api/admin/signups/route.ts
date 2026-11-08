import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const students = await query<any[]>(
      `SELECT u.id, u.name, u.email, u.phone, u.college_name, u.profile_pic, u.created_at,
              COUNT(r.id) as registrations_count
       FROM uc_events_users u
       LEFT JOIN uc_events_registrations r ON u.id = r.user_id AND r.status = 'registered'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Admin GET signups error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch signups' }, { status: 500 });
  }
}
