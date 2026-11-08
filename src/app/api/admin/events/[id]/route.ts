import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
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

    const formattedEventDate = new Date(event_date).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEndDate = end_date ? new Date(end_date).toISOString().slice(0, 19).replace('T', ' ') : null;
    const formattedDeadline = registration_deadline ? new Date(registration_deadline).toISOString().slice(0, 19).replace('T', ' ') : null;

    await query(
      `UPDATE uc_events_events SET
        title = ?,
        category_name = ?,
        description = ?,
        short_description = ?,
        event_date = ?,
        end_date = ?,
        registration_deadline = ?,
        venue = ?,
        mode = ?,
        poster_url = COALESCE(?, poster_url),
        max_participants = ?,
        fee = ?,
        organizer_name = ?,
        organizer_contact = ?,
        status = ?
       WHERE id = ?`,
      [
        title.trim(),
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
        organizer_name || '',
        organizer_contact || '',
        status || 'published',
        Number(id),
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully!',
    });
  } catch (error: any) {
    console.error('Admin PUT event error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Delete registrations first
    await query('DELETE FROM uc_events_registrations WHERE event_id = ?', [Number(id)]);

    // Delete event
    await query('DELETE FROM uc_events_events WHERE id = ?', [Number(id)]);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully!',
    });
  } catch (error: any) {
    console.error('Admin DELETE event error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
