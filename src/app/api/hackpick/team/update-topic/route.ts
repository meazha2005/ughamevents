import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, domain, topic } = await req.json();

    if (!team_id) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const teams = await query<any[]>(
      'SELECT id, leader_id, ppt_submitted_at FROM uc_events_teams WHERE id = ?',
      [team_id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    if (team.leader_id !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Only the team leader can choose or update the domain and topic' },
        { status: 403 }
      );
    }

    if (team.ppt_submitted_at) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your Round 1 PPT has already been submitted and finalized. The chosen domain and topic are locked.',
        },
        { status: 400 }
      );
    }

    await query(
      'UPDATE uc_events_teams SET domain = ?, topic = ? WHERE id = ?',
      [domain?.trim() || null, topic?.trim() || null, team_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Domain and topic updated successfully. You can modify them anytime before submitting your PPT.',
      domain: domain?.trim(),
      topic: topic?.trim(),
    });
  } catch (error: any) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update topic' },
      { status: 500 }
    );
  }
}
