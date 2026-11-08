import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    let sql = `
      SELECT r.*, e.title as event_title, e.event_date, e.mode, e.venue
      FROM uc_events_registrations r
      JOIN uc_events_events e ON r.event_id = e.id
    `;
    const params: any[] = [];

    if (eventId) {
      sql += ' WHERE r.event_id = ?';
      params.push(Number(eventId));
    }

    sql += ' ORDER BY r.registered_at DESC';

    const registrations = await query<any[]>(sql, params);

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    console.error('Admin GET registrations error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
