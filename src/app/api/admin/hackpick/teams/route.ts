import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find HACK PICK event
    const events = await query<any[]>(
      'SELECT id, title FROM uc_events_events WHERE slug = "hack-pick" OR title LIKE "%HACK PICK%" LIMIT 1'
    );

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { total_teams: 0, paid_teams: 0, total_participants: 0, ppt_submitted: 0, total_revenue: 0 },
        teams: [],
      });
    }

    const event = events[0];

    // Fetch all teams for HACK PICK
    const teams = await query<any[]>(
      `SELECT t.*, 
              u.name as leader_name, u.email as leader_email, u.phone as leader_phone, u.college_name as leader_college
       FROM uc_events_teams t
       LEFT JOIN uc_events_users u ON t.leader_id = u.id
       WHERE t.event_id = ?
       ORDER BY t.created_at DESC`,
      [event.id]
    );

    // Fetch all team members
    const allMembers = await query<any[]>(
      `SELECT tm.team_id, tm.role, tm.joined_at,
              u.id as user_id, u.name, u.email, u.phone, u.college_name, u.profile_pic
       FROM uc_events_team_members tm
       JOIN uc_events_teams t ON tm.team_id = t.id
       JOIN uc_events_users u ON tm.user_id = u.id
       WHERE t.event_id = ?
       ORDER BY CASE WHEN tm.role = 'leader' THEN 1 ELSE 2 END, tm.joined_at ASC`,
      [event.id]
    );

    // Group members by team_id
    const membersByTeam: { [key: number]: any[] } = {};
    for (const m of allMembers) {
      if (!membersByTeam[m.team_id]) {
        membersByTeam[m.team_id] = [];
      }
      membersByTeam[m.team_id].push(m);
    }

    const enrichedTeams = teams.map((team) => {
      const members = membersByTeam[team.id] || [];
      return {
        ...team,
        members_count: members.length,
        members,
        is_ppt_submitted: Boolean(team.ppt_submitted_at),
      };
    });

    const paidTeamsCount = enrichedTeams.filter((t) => t.payment_status === 'paid').length;
    const pptSubmittedCount = enrichedTeams.filter((t) => Boolean(t.ppt_submitted_at)).length;

    return NextResponse.json({
      success: true,
      stats: {
        total_teams: enrichedTeams.length,
        paid_teams: paidTeamsCount,
        pending_teams: enrichedTeams.length - paidTeamsCount,
        total_participants: allMembers.length,
        ppt_submitted: pptSubmittedCount,
        total_revenue: paidTeamsCount * 149,
      },
      teams: enrichedTeams,
    });
  } catch (error: any) {
    console.error('Error fetching admin Hack Pick teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve Hack Pick teams' },
      { status: 500 }
    );
  }
}
