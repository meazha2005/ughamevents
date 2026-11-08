import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, ppt_url, domain, topic } = await req.json();

    if (!team_id || !ppt_url) {
      return NextResponse.json(
        { success: false, error: 'Team ID and PPT Google Drive link are required' },
        { status: 400 }
      );
    }

    const cleanUrl = ppt_url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Google Drive or presentation URL starting with https://' },
        { status: 400 }
      );
    }

    const teams = await query<any[]>(
      'SELECT id, leader_id, payment_status, ppt_submitted_at, domain, topic FROM uc_events_teams WHERE id = ?',
      [team_id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    if (team.leader_id !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Only the team leader can submit the PPT' },
        { status: 403 }
      );
    }

    if (team.payment_status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: 'Team registration fee (₹149) must be completed before submitting Round 1 PPT.',
        },
        { status: 400 }
      );
    }

    if (team.ppt_submitted_at) {
      return NextResponse.json(
        {
          success: false,
          error: 'PPT submission has already been finalized and cannot be modified.',
        },
        { status: 400 }
      );
    }

    const finalDomain = domain?.trim() || team.domain || 'Open Innovation';
    const finalTopic = topic?.trim() || team.topic || 'Innovation Solution';

    await query(
      `UPDATE uc_events_teams 
       SET ppt_url = ?, domain = ?, topic = ?, ppt_submitted_at = NOW() 
       WHERE id = ?`,
      [cleanUrl, finalDomain, finalTopic, team_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Round 1 PPT submitted and finalized successfully! Your submission is now recorded for evaluation.',
      ppt_url: cleanUrl,
      domain: finalDomain,
      topic: finalTopic,
      submitted_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error submitting PPT:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit PPT' },
      { status: 500 }
    );
  }
}
