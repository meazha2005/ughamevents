import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        { success: false, error: 'Please sign in as a student to join a team' },
        { status: 401 }
      );
    }

    const { invite_code } = await req.json();

    if (!invite_code || !invite_code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const cleanCode = invite_code.trim().toUpperCase();

    // Find team by invite code
    const teams = await query<any[]>(
      `SELECT t.*, e.id as event_id, e.title as event_title 
       FROM uc_events_teams t
       JOIN uc_events_events e ON t.event_id = e.id
       WHERE t.invite_code = ?`,
      [cleanCode]
    );

    if (teams.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite code. No team found with this code.' },
        { status: 404 }
      );
    }

    const team = teams[0];

    // Check if user is already in this or another team for HACK PICK
    const userTeams = await query<any[]>(
      `SELECT tm.team_id, t.team_name 
       FROM uc_events_team_members tm
       JOIN uc_events_teams t ON tm.team_id = t.id
       WHERE tm.user_id = ? AND t.event_id = ?`,
      [session.id, team.event_id]
    );

    if (userTeams.length > 0) {
      if (userTeams[0].team_id === team.id) {
        return NextResponse.json(
          { success: false, error: 'You are already a member of this team' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `You are already part of team "${userTeams[0].team_name}". Leave your existing team to join a new one.`,
        },
        { status: 400 }
      );
    }

    // Check member count: maximum 3 members
    const members = await query<any[]>(
      'SELECT id FROM uc_events_team_members WHERE team_id = ?',
      [team.id]
    );

    if (members.length >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'This team has already reached the maximum limit of 3 members',
        },
        { status: 400 }
      );
    }

    // Insert as team member
    await query(
      `INSERT INTO uc_events_team_members (team_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [team.id, session.id]
    );

    // If team is already paid, ensure registration record exists
    if (team.payment_status === 'paid') {
      const regCheck = await query<any[]>(
        'SELECT id FROM uc_events_registrations WHERE event_id = ? AND user_id = ?',
        [team.event_id, session.id]
      );

      if (regCheck.length === 0) {
        const studentInfo = await query<any[]>(
          'SELECT name, email, phone, college_name FROM uc_events_users WHERE id = ?',
          [session.id]
        );
        if (studentInfo.length > 0) {
          const u = studentInfo[0];
          await query(
            `INSERT INTO uc_events_registrations 
             (event_id, user_id, user_name, user_email, user_phone, user_college, status)
             VALUES (?, ?, ?, ?, ?, ?, 'registered')`,
            [team.event_id, session.id, u.name, u.email, u.phone || '', u.college_name || '']
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined team "${team.team_name}"!`,
      team_id: team.id,
      team_name: team.team_name,
    });
  } catch (error: any) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to join team' },
      { status: 500 }
    );
  }
}
