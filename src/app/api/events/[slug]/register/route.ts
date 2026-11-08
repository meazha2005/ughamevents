import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Please sign in as a student to register for events' },
        { status: 401 }
      );
    }

    const { slug } = await context.params;

    // Fetch event
    const events = await query<any[]>(
      'SELECT id, title, max_participants, status, event_date FROM uc_events_events WHERE slug = ?',
      [slug]
    );

    if (events.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const event = events[0];

    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'This event is not accepting registrations.' },
        { status: 400 }
      );
    }

    // Check capacity if set
    if (event.max_participants > 0) {
      const regCount = await query<any[]>(
        "SELECT COUNT(*) as count FROM uc_events_registrations WHERE event_id = ? AND status = 'registered'",
        [event.id]
      );
      if (regCount[0].count >= event.max_participants) {
        return NextResponse.json(
          { success: false, error: 'Sorry, this event has reached full capacity.' },
          { status: 400 }
        );
      }
    }

    // Get user details
    const users = await query<any[]>(
      'SELECT name, email, phone, college_name FROM uc_events_users WHERE id = ?',
      [session.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const user = users[0];

    // Check if already registered
    const existing = await query<any[]>(
      'SELECT id, status FROM uc_events_registrations WHERE event_id = ? AND user_id = ?',
      [event.id, session.id]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'registered') {
        return NextResponse.json({
          success: true,
          message: 'You are already registered for this event!',
        });
      } else {
        // Re-activate registration
        await query(
          "UPDATE uc_events_registrations SET status = 'registered', registered_at = NOW() WHERE id = ?",
          [existing[0].id]
        );
        return NextResponse.json({
          success: true,
          message: 'Registration re-activated successfully!',
        });
      }
    }

    // Create registration
    await query(
      `INSERT INTO uc_events_registrations (event_id, user_id, user_name, user_email, user_phone, user_college, status)
       VALUES (?, ?, ?, ?, ?, ?, 'registered')`,
      [event.id, session.id, user.name, user.email, user.phone, user.college_name || '']
    );

    return NextResponse.json({
      success: true,
      message: `Successfully registered for ${event.title}!`,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}
