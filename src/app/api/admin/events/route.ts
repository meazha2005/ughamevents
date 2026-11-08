import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';


function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString().slice(-5)}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const events = await query<any[]>(
      `SELECT e.*, COUNT(r.id) as registered_count
       FROM uc_events_events e
       LEFT JOIN uc_events_registrations r ON e.id = r.event_id AND r.status = 'registered'
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    );

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('Admin GET events error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category_name,
      description,
      short_description,
      event_date,
      end_date,
      registration_deadline,
      venue,
      mode,
      poster_url,
      max_participants,
      fee,
      organizer_name,
      organizer_contact,
      status,
    } = body;

    if (!title || !event_date || !venue) {
      return NextResponse.json(
        { success: false, error: 'Title, event date, and venue are required.' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);

    const formattedEventDate = new Date(event_date).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEndDate = end_date ? new Date(end_date).toISOString().slice(0, 19).replace('T', ' ') : null;
    const formattedDeadline = registration_deadline ? new Date(registration_deadline).toISOString().slice(0, 19).replace('T', ' ') : null;

    const result: any = await query(
      `INSERT INTO uc_events_events (
        title, slug, category_name, description, short_description,
        event_date, end_date, registration_deadline, venue, mode,
        poster_url, max_participants, fee, organizer_name, organizer_contact, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        slug,
        category_name || 'Seminar',
        description || '',
        short_description || (description ? description.slice(0, 180) : ''),
        formattedEventDate,
        formattedEndDate,
        formattedDeadline,
        venue.trim(),
        mode || 'Offline',
        poster_url || null,
        Number(max_participants) || 0,
        Number(fee) || 0.0,
        organizer_name || 'UGHAM Tech',
        organizer_contact || 'events@ugham.com',
        status || 'published',
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Event created successfully!',
      eventId: result.insertId,
      slug,
    });
  } catch (error: any) {
    console.error('Admin POST event error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
