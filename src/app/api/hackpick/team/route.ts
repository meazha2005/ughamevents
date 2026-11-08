import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find if user is in any team for HACK PICK
    const memberships = await query<any[]>(
      `SELECT tm.team_id, tm.role as member_role, tm.joined_at,
              t.id, t.event_id, t.team_name, t.invite_code, t.leader_id,
              t.domain, t.topic, t.ppt_url, t.ppt_submitted_at,
              t.payment_status, t.order_id, t.payment_id, t.payment_amount, t.payment_date,
              t.whatsapp_link, t.status as team_status, t.created_at
       FROM uc_events_team_members tm
       JOIN uc_events_teams t ON tm.team_id = t.id
       JOIN uc_events_events e ON t.event_id = e.id
       WHERE tm.user_id = ? AND (e.slug = 'hack-pick' OR e.title LIKE '%HACK PICK%')
       ORDER BY t.created_at DESC LIMIT 1`,
      [session.id]
    );

    if (memberships.length === 0) {
      return NextResponse.json({
        success: true,
        in_team: false,
        team: null,
      });
    }

    const team = memberships[0];

    // Fetch all members of this team
    const members = await query<any[]>(
      `SELECT tm.id as membership_id, tm.role, tm.joined_at,
              u.id as user_id, u.name, u.email, u.phone, u.college_name, u.profile_pic
       FROM uc_events_team_members tm
       JOIN uc_events_users u ON tm.user_id = u.id
       WHERE tm.team_id = ?
       ORDER BY CASE WHEN tm.role = 'leader' THEN 1 ELSE 2 END, tm.joined_at ASC`,
      [team.team_id]
    );

    return NextResponse.json({
      success: true,
      in_team: true,
      is_leader: team.leader_id === session.id,
      team: {
        id: team.id,
        team_name: team.team_name,
        invite_code: team.invite_code,
        leader_id: team.leader_id,
        domain: team.domain,
        topic: team.topic,
        ppt_url: team.ppt_url,
        ppt_submitted_at: team.ppt_submitted_at,
        is_ppt_submitted: Boolean(team.ppt_submitted_at),
        payment_status: team.payment_status,
        payment_id: team.payment_id,
        payment_amount: team.payment_amount,
        payment_date: team.payment_date,
        whatsapp_link: team.whatsapp_link,
        status: team.team_status,
        members_count: members.length,
        max_members: 3,
        can_add_members: members.length < 3,
        members,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Hack Pick team:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve team details' },
      { status: 500 }
    );
  }
}
