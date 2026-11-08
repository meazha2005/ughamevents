const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: '192.169.147.255',
    port: 3306,
    user: 'MEAZHA',
    password: 'dZYRYi(o(0*U',
    database: 'le_test',
  });

  try {
    console.log('Connecting to database...');

    // 1. Teams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uc_events_teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        team_name VARCHAR(150) NOT NULL,
        invite_code VARCHAR(32) NOT NULL UNIQUE,
        leader_id INT NOT NULL,
        domain VARCHAR(100) DEFAULT NULL,
        topic VARCHAR(255) DEFAULT NULL,
        ppt_url TEXT DEFAULT NULL,
        ppt_submitted_at DATETIME DEFAULT NULL,
        payment_status ENUM('pending', 'paid') DEFAULT 'pending',
        order_id VARCHAR(100) DEFAULT NULL,
        payment_id VARCHAR(100) DEFAULT NULL,
        payment_amount DECIMAL(10, 2) DEFAULT 149.00,
        payment_date DATETIME DEFAULT NULL,
        whatsapp_link VARCHAR(255) DEFAULT 'https://chat.whatsapp.com/H9jIV4PaMEE7MxvFVsjPQ6?s=cl&p=i&mlu=4&ilr=4&iam=2',
        status ENUM('active', 'disqualified', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_event (event_id),
        INDEX idx_leader (leader_id),
        INDEX idx_invite (invite_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('uc_events_teams table ready');

    // 2. Team Members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uc_events_team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('leader', 'member') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_team_user (team_id, user_id),
        INDEX idx_user (user_id),
        INDEX idx_team (team_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('uc_events_team_members table ready');

    // 3. Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS uc_events_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        order_id VARCHAR(100) NOT NULL,
        payment_id VARCHAR(100) DEFAULT NULL,
        signature VARCHAR(255) DEFAULT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('created', 'paid', 'failed') DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order (order_id),
        INDEX idx_payment (payment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('uc_events_payments table ready');

    // 4. Ensure HACK PICK event exists in uc_events_events
    const [existing] = await pool.query(
      'SELECT id, title, slug FROM uc_events_events WHERE slug = "hack-pick" OR title LIKE "%HACK PICK%"'
    );
    console.log('Existing Hack Pick events count:', existing.length);

    const eventData = {
      title: 'HACK PICK',
      slug: 'hack-pick',
      category_name: 'Hackathon',
      description: `HACK PICK is a premier national inter-college hackathon designed to challenge innovators across engineering and arts colleges.

👥 Team Structure:
• 2 to 3 students in a team.
• Team Leader registers the team and shares the unique Invite Code with teammates.
• Team Leader can manage, remove, or replace teammates.
• Registration Fee: ₹149 per team.

⚡ 4 Intensive Rounds:
• Round 1 (Online): PPT Submission via Google Drive link.
  - Domains and problem statements with official PPT format will be released on November 15, 2026.
  - Team leaders can choose the domain and topic, and change them anytime before final PPT submission.
  - Once the PPT is submitted, selections and submission are finalized.
  - Registration closes and last date for PPT submission: November 25, 2026.
• Round 2 (Online): Technical Innovation & Code Evaluation (details announced soon).
• Round 3 (Online): Live Prototype Showcase (details announced soon).
• Round 4 (Offline): Grand Finale (venue & date announced soon).
Final Event Date: December 18, 2026.

🏆 Cash Prize Pool:
🥇 1st Prize: ₹15,000 INR
🥈 2nd Prize: ₹12,000 INR
🥉 3rd Prize: ₹10,000 INR

📲 Community Support:
Upon successful payment of ₹149 per team, an official confirmation email will be delivered containing the WhatsApp group invite link:
https://chat.whatsapp.com/H9jIV4PaMEE7MxvFVsjPQ6?s=cl&p=i&mlu=4&ilr=4&iam=2`,
      short_description: 'National Level College Hackathon with ₹37,000 cash prize pool across 4 rigorous rounds (Online & Offline Finale). ₹149 per team (2-3 members).',
      event_date: '2026-12-18 09:00:00',
      end_date: '2026-12-18 18:00:00',
      registration_deadline: '2026-11-25 23:59:59',
      venue: 'Online (Rounds 1-3) & Offline Grand Finale (Round 4)',
      mode: 'Hybrid',
      fee: 149.00,
      max_participants: 500,
      organizer_name: 'UGHAM Innovations',
      organizer_contact: 'founder@ztoitech.com',
      status: 'published',
    };

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO uc_events_events 
         (title, slug, category_name, description, short_description, event_date, end_date, registration_deadline, venue, mode, fee, max_participants, organizer_name, organizer_contact, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.title,
          eventData.slug,
          eventData.category_name,
          eventData.description,
          eventData.short_description,
          eventData.event_date,
          eventData.end_date,
          eventData.registration_deadline,
          eventData.venue,
          eventData.mode,
          eventData.fee,
          eventData.max_participants,
          eventData.organizer_name,
          eventData.organizer_contact,
          eventData.status,
        ]
      );
      console.log('Inserted HACK PICK event successfully.');
    } else {
      await pool.query(
        `UPDATE uc_events_events 
         SET title = ?, category_name = ?, description = ?, short_description = ?, event_date = ?, end_date = ?, registration_deadline = ?, venue = ?, mode = ?, fee = ?, max_participants = ?, organizer_name = ?, organizer_contact = ?, status = ?
         WHERE id = ?`,
        [
          eventData.title,
          eventData.category_name,
          eventData.description,
          eventData.short_description,
          eventData.event_date,
          eventData.end_date,
          eventData.registration_deadline,
          eventData.venue,
          eventData.mode,
          eventData.fee,
          eventData.max_participants,
          eventData.organizer_name,
          eventData.organizer_contact,
          eventData.status,
          existing[0].id,
        ]
      );
      console.log('Updated existing HACK PICK event id:', existing[0].id);
    }
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    await pool.end();
  }
}

main();
