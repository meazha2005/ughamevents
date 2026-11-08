import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { sendHackPickConfirmationEmail } from '@/lib/email';

const WHATSAPP_GROUP_LINK =
  'https://chat.whatsapp.com/H9jIV4PaMEE7MxvFVsjPQ6?s=cl&p=i&mlu=4&ilr=4&iam=2';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!team_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Incomplete transaction parameters' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'eNqRfHp5JkOClGhhI3ziSgtI';

    // Cryptographic signature verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isAuthentic) {
      console.error('Razorpay signature mismatch for order:', razorpay_order_id);
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed. Invalid transaction.' },
        { status: 400 }
      );
    }

    // Retrieve team details
    const teams = await query<any[]>(
      `SELECT t.*, e.id as event_id, e.title as event_title 
       FROM uc_events_teams t
       JOIN uc_events_events e ON t.event_id = e.id
       WHERE t.id = ?`,
      [team_id]
    );

    if (teams.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teams[0];

    // Update team payment status
    await query(
      `UPDATE uc_events_teams 
       SET payment_status = 'paid', payment_id = ?, payment_date = NOW(), order_id = ?, whatsapp_link = ?
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_order_id, WHATSAPP_GROUP_LINK, team.id]
    );

    // Update payments record
    await query(
      `UPDATE uc_events_payments 
       SET status = 'paid', payment_id = ?, signature = ?
       WHERE order_id = ?`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    // Register all team members in uc_events_registrations
    const members = await query<any[]>(
      `SELECT tm.user_id, u.name, u.email, u.phone, u.college_name 
       FROM uc_events_team_members tm
       JOIN uc_events_users u ON tm.user_id = u.id
       WHERE tm.team_id = ?`,
      [team.id]
    );

    for (const m of members) {
      const regCheck = await query<any[]>(
        'SELECT id FROM uc_events_registrations WHERE event_id = ? AND user_id = ?',
        [team.event_id, m.user_id]
      );

      if (regCheck.length === 0) {
        await query(
          `INSERT INTO uc_events_registrations 
           (event_id, user_id, user_name, user_email, user_phone, user_college, status)
           VALUES (?, ?, ?, ?, ?, ?, 'registered')`,
          [team.event_id, m.user_id, m.name, m.email, m.phone || '', m.college_name || '']
        );
      }
    }

    // Send confirmation email with WhatsApp group invite link to team leader & members
    for (const m of members) {
      try {
        await sendHackPickConfirmationEmail({
          to: m.email,
          recipientName: m.name,
          teamName: team.team_name,
          inviteCode: team.invite_code,
          paymentId: razorpay_payment_id,
          amount: 149,
          whatsappLink: WHATSAPP_GROUP_LINK,
        });
      } catch (mailErr) {
        console.warn(`Failed to dispatch confirmation email to ${m.email}:`, mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Welcome to HACK PICK.',
      payment_id: razorpay_payment_id,
      whatsapp_link: WHATSAPP_GROUP_LINK,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
