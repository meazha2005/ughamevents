import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, member_user_id } = await req.json();

    if (!team_id || !member_user_id) {
      return NextResponse.json(
        { success: false, error: 'Team ID and Member ID are required' },
        { status: 400 }
      );
    }

    // Verify session user is the team leader
    const teams = await query<any[]>(
      'SELECT id, leader_id, team_name, event_id FROM uc_events_teams WHERE id = ?',
      [team_id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    if (team.leader_id !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Only the team leader can manage or remove team members' },
        { status: 403 }
      );
    }

    if (Number(member_user_id) === Number(session.id)) {
      return NextResponse.json(
        { success: false, error: 'Team leader cannot be removed. You can delete or transfer the team if needed.' },
        { status: 400 }
      );
    }

    // Remove member from team
    await query(
      'DELETE FROM uc_events_team_members WHERE team_id = ? AND user_id = ? AND role = "member"',
      [team_id, Number(member_user_id)]
    );

    // Also remove registration record for this member for this event
    await query(
      'DELETE FROM uc_events_registrations WHERE event_id = ? AND user_id = ?',
      [team.event_id, Number(member_user_id)]
    );

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully. You can now invite another teammate with your invite code.',
    });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
