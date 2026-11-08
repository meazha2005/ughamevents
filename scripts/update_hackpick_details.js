const mysql = require('mysql2/promise');

async function updateHackPick() {
  const pool = mysql.createPool({
    host: '192.169.147.255',
    port: 3306,
    user: 'MEAZHA',
    password: 'dZYRYi(o(0*U',
    database: 'le_test',
  });

  try {
    const updatedDescription = `HACK PICK is a premier national inter-college hackathon designed to challenge innovators across engineering and arts colleges.

👥 Team Structure:
• 2 to 3 students in a team.
• Team Leader registers the team and shares the unique Invite Code with teammates.
• Team Leader can manage, remove, or replace teammates prior to finalization.
• Registration Fee: ₹149 per team.

⚡ 4 Rigorous Rounds:
• Round 1 (Online): PPT Submission via Google Drive link.
  - Domains and problem statements with official PPT format will be released on November 15, 2026.
  - Team leaders can choose the domain and topic, and change them anytime before final PPT submission.
  - Once the PPT is submitted, selections and submission are finalized.
  - Registration closes and last day for PPT submission: November 25, 2026.
  - Round 1 Result will be officially announced & released on December 18, 2026!
• Round 2 (Online): Technical Innovation & Coding Sprint (Dates announced soon).
• Round 3 (Online): Working Prototype Demonstration (Dates announced soon).
• Round 4 (Offline): Grand Finale & On-Stage Pitching (Dates announced soon).

🏆 Cash Prize Pool:
🥇 1st Prize: ₹15,000 INR
🥈 2nd Prize: ₹12,000 INR
🥉 3rd Prize: ₹10,000 INR

📲 Community Support:
Upon successful registration and payment of ₹149 per team, the official WhatsApp group invite link will be delivered directly to your registered email address for mentor support and live round announcements.`;

    const shortDesc = 'National College Hackathon with ₹37,000 cash prizes across 4 rounds. Round 1 Result: Dec 18, 2026. ₹149 per team (2-3 members).';

    await pool.query(
      `UPDATE uc_events_events 
       SET description = ?, short_description = ?, organizer_contact = 'info@ugham.com', event_date = '2026-12-18 10:00:00'
       WHERE slug = 'hack-pick' OR title LIKE '%HACK PICK%'`,
      [updatedDescription, shortDesc]
    );

    console.log('HACK PICK event updated in database successfully.');
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await pool.end();
  }
}

updateHackPick();
