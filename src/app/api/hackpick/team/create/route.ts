import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HP-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Please sign in as a student to create a team' },
        { status: 401 }
      );
    }

    const { team_name, domain, topic } = await req.json();

    if (!team_name || team_name.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Team name must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Get HACK PICK event id
    const events = await query<any[]>(
      'SELECT id, title, fee FROM uc_events_events WHERE slug = "hack-pick" OR title LIKE "%HACK PICK%" LIMIT 1'
    );

    if (events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'HACK PICK event not found' },
        { status: 404 }
      );
    }

    const event = events[0];

    // Check if user is already in a team for this event
    const existing = await query<any[]>(
      `SELECT tm.team_id, t.team_name 
       FROM uc_events_team_members tm
       JOIN uc_events_teams t ON tm.team_id = t.id
       WHERE tm.user_id = ? AND t.event_id = ?`,
      [session.id, event.id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `You are already part of team "${existing[0].team_name}". Leave or delete your existing team first.`,
        },
        { status: 400 }
      );
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const check = await query<any[]>(
        'SELECT id FROM uc_events_teams WHERE invite_code = ?',
        [inviteCode]
      );
      if (check.length === 0) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    // Insert Team
    const result: any = await query(
      `INSERT INTO uc_events_teams 
       (event_id, team_name, invite_code, leader_id, domain, topic, payment_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        event.id,
        team_name.trim(),
        inviteCode,
        session.id,
        domain?.trim() || null,
        topic?.trim() || null,
        event.fee || 149.00,
      ]
    );

    const teamId = result.insertId;

    // Insert Leader as team member
    await query(
      `INSERT INTO uc_events_team_members (team_id, user_id, role)
       VALUES (?, ?, 'leader')`,
      [teamId, session.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Team registered successfully! Share your invite code with 1 or 2 teammates.',
      team: {
        id: teamId,
        team_name: team_name.trim(),
        invite_code: inviteCode,
        leader_id: session.id,
        domain: domain?.trim() || null,
        topic: topic?.trim() || null,
        payment_status: 'pending',
        payment_amount: event.fee || 149.00,
      },
    });
  } catch (error: any) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create team' },
      { status: 500 }
    );
  }
}
