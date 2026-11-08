import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER || 'founder@ztoitech.com',
    pass: process.env.SMTP_PASS || 'giaaiszeucydqhjl',
  },
});

export async function sendPasswordResetOtpEmail(to: string, otpCode: string, studentName?: string) {
  const name = studentName || 'Student';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>UGHAM Events - Password Reset OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 32, 216, 0.06); }
        .header { background: linear-gradient(135deg, #0020d8 0%, #7928ca 50%, #c0047e 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo-text { font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0; }
        .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #0020d8; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0020d8; margin: 0; font-family: monospace; }
        .note { font-size: 13px; color: #64748b; margin-top: 8px; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">UGHAM</div>
          <div class="subtitle">Where Evolution Starts • Events Portal</div>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p class="text">You have requested a one-time verification code (OTP) to reset the password for your UGHAM Events student account.</p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="note">This code will expire in 10 minutes. Do not share it with anyone.</div>
          </div>
          <p class="text">If you did not request this password reset, please ignore this email or contact support at info@ugham.com.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} UGHAM Events Portal (events.ugham.com) • Contact: info@ugham.com
        </div>
      </div>
    </body>
    </html>
  `;

  return await transporter.sendMail({
    from: `"UGHAM Events" <${process.env.SMTP_FROM || 'info@ugham.com'}>`,
    replyTo: 'info@ugham.com',
    to,
    subject: 'Your Password Reset OTP - UGHAM Events',
    html,
  });
}

export async function sendHackPickConfirmationEmail({
  to,
  recipientName,
  teamName,
  inviteCode,
  paymentId,
  amount = 149,
  whatsappLink = 'https://chat.whatsapp.com/H9jIV4PaMEE7MxvFVsjPQ6?s=cl&p=i&mlu=4&ilr=4&iam=2',
}: {
  to: string;
  recipientName: string;
  teamName: string;
  inviteCode: string;
  paymentId: string;
  amount?: number;
  whatsappLink?: string;
}) {
  const name = recipientName || 'Innovator';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>HACK PICK Registration Confirmed</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 32, 216, 0.08); }
        .header { background: linear-gradient(135deg, #0020d8 0%, #7928ca 50%, #c0047e 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
        .title { font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 0.5px; }
        .subtitle { font-size: 13px; opacity: 0.92; margin-top: 6px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .lead { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .val { color: #0f172a; font-weight: 700; }
        .code-box { background: #0020d8; color: #ffffff; border-radius: 12px; padding: 14px 20px; text-align: center; font-size: 18px; font-weight: 800; letter-spacing: 3px; font-family: monospace; margin: 16px 0; }
        .whatsapp-btn { display: block; text-align: center; background: #25D366; color: #ffffff !important; padding: 16px 28px; border-radius: 14px; font-size: 16px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35); margin: 24px 0 16px; }
        .timeline { background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #334155; }
        .footer { padding: 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">Official Registration Confirmation</div>
          <h1 class="title">HACK PICK 2026</h1>
          <div class="subtitle">Where Evolution Starts • National Inter-College Pitching Event</div>
        </div>
        <div class="content">
          <div class="greeting">Congratulations, ${name}! 🎉</div>
          <p class="lead">
            Your team registration and payment of <strong>₹${amount}</strong> for <strong>HACK PICK</strong> have been successfully verified!
          </p>

          <div class="card">
            <div class="row"><span class="label">Team Name:</span><span class="val">${teamName}</span></div>
            <div class="row"><span class="label">Payment ID:</span><span class="val">${paymentId}</span></div>
            <div class="row"><span class="label">Amount Paid:</span><span class="val">₹${amount} INR (Verified)</span></div>
            <div class="row"><span class="label">Team Size:</span><span class="val">2 to 3 Members</span></div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
              Share Invite Code With Teammates
            </span>
            <div class="code-box">${inviteCode}</div>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Your teammates can join your team using this code after logging in.</p>
          </div>

          <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">
            👉 Join Official WhatsApp Group
          </a>
          <p style="font-size: 12px; text-align: center; color: #64748b; margin-top: 6px;">
            Join the WhatsApp group for live mentor assistance, round announcements, and queries.
          </p>

          <div class="timeline">
            <strong>📅 Important Pitching Event Milestones:</strong><br/>
            • <strong>Nov 15, 2026:</strong> Domains, Problem Statements & PPT format released.<br/>
            • <strong>Nov 25, 2026:</strong> Registrations close & Last day for Round 1 PPT submission (Google Drive link).<br/>
            • <strong>Dec 18, 2026:</strong> Round 1 Results will be officially announced & released!<br/>
            • <strong>Rounds 2, 3 & 4 (Grand Finale):</strong> Dates will be announced soon.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} UGHAM Events • events.ugham.com • Contact: info@ugham.com
        </div>
      </div>
    </body>
    </html>
  `;

  return await transporter.sendMail({
    from: `"UGHAM Events" <${process.env.SMTP_FROM || 'info@ugham.com'}>`,
    replyTo: 'info@ugham.com',
    to,
    subject: `Registration Confirmed: ${teamName} at HACK PICK 2026`,
    html,
  });
}
