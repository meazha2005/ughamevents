import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const session = await getSession(req);
    const userId = session?.id || 0;

    const events = await query<any[]>(
      `SELECT e.*, 
              (COUNT(DISTINCT r.id) + (SELECT COUNT(DISTINCT tm2.user_id) FROM uc_events_team_members tm2 JOIN uc_events_teams t2 ON tm2.team_id = t2.id WHERE t2.event_id = e.id)) AS registered_count,
              (EXISTS(SELECT 1 FROM uc_events_registrations ur WHERE ur.event_id = e.id AND ur.user_id = ? AND ur.status = 'registered')
               OR EXISTS(SELECT 1 FROM uc_events_team_members tm JOIN uc_events_teams t ON tm.team_id = t.id WHERE t.event_id = e.id AND tm.user_id = ?)) AS is_registered
       FROM uc_events_events e
       LEFT JOIN uc_events_registrations r ON e.id = r.event_id AND r.status = 'registered'
       WHERE e.slug = ?
       GROUP BY e.id`,
      [userId, userId, slug]
    );

    if (events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = {
      ...events[0],
      is_registered: Boolean(events[0].is_registered),
    };

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Event single GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}
