import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id } = await req.json();

    if (!team_id) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    const teams = await query<any[]>(
      `SELECT t.*, e.title as event_title, e.fee
       FROM uc_events_teams t
       JOIN uc_events_events e ON t.event_id = e.id
       WHERE t.id = ?`,
      [team_id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    // Only leader can initiate payment for the team
    if (team.leader_id !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Only the team leader can complete team registration payment' },
        { status: 403 }
      );
    }

    if (team.payment_status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment has already been completed for this team' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_Sq847FjnOyrls1';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'eNqRfHp5JkOClGhhI3ziSgtI';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = 14900; // 149 INR

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `hp_${team.id}_${Date.now()}`.slice(0, 40),
      notes: {
        team_id: String(team.id),
        team_name: String(team.team_name),
        leader_email: String(session.email),
        event_slug: 'hack-pick',
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save order in teams and payments table
    await query(
      'UPDATE uc_events_teams SET order_id = ? WHERE id = ?',
      [order.id, team.id]
    );

    await query(
      `INSERT INTO uc_events_payments 
       (team_id, user_id, event_id, order_id, amount, currency, status)
       VALUES (?, ?, ?, ?, 149.00, 'INR', 'created')`,
      [team.id, session.id, team.event_id, order.id]
    );

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: keyId,
      team_name: team.team_name,
      team_id: team.id,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
