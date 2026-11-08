import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');

    const session = await getSession(req);
    const userId = session?.id || 0;

    let sql = `
      SELECT e.*, 
             (COUNT(DISTINCT r.id) + (SELECT COUNT(DISTINCT tm2.user_id) FROM uc_events_team_members tm2 JOIN uc_events_teams t2 ON tm2.team_id = t2.id WHERE t2.event_id = e.id)) AS registered_count,
             (EXISTS(SELECT 1 FROM uc_events_registrations ur WHERE ur.event_id = e.id AND ur.user_id = ? AND ur.status = 'registered')
              OR EXISTS(SELECT 1 FROM uc_events_team_members tm JOIN uc_events_teams t ON tm.team_id = t.id WHERE t.event_id = e.id AND tm.user_id = ?)) AS is_registered
      FROM uc_events_events e
      LEFT JOIN uc_events_registrations r ON e.id = r.event_id AND r.status = 'registered'
      WHERE e.status = 'published'
    `;

    const params: any[] = [userId, userId];

    if (category && category.toLowerCase() !== 'all') {
      sql += ` AND LOWER(e.category_name) = ?`;
      params.push(category.toLowerCase());
    }

    if (mode && mode.toLowerCase() !== 'all') {
      sql += ` AND LOWER(e.mode) = ?`;
      params.push(mode.toLowerCase());
    }

    if (search && search.trim() !== '') {
      sql += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)`;
      const searchWild = `%${search.trim()}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    sql += ` GROUP BY e.id ORDER BY e.event_date ASC`;

    const events = await query<any[]>(sql, params);

    // Also fetch categories
    const categories = await query<any[]>(
      'SELECT id, name, slug FROM uc_events_categories ORDER BY name ASC'
    );

    return NextResponse.json({
      success: true,
      events: events.map((ev) => ({
        ...ev,
        is_registered: Boolean(ev.is_registered),
      })),
      categories,
    });
  } catch (error: any) {
    console.error('Events GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
