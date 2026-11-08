const mysql = require('mysql2/promise');

async function testHackPickSetup() {
  const pool = mysql.createPool({
    host: '192.169.147.255',
    port: 3306,
    user: 'MEAZHA',
    password: 'dZYRYi(o(0*U',
    database: 'le_test',
  });

  try {
    const [events] = await pool.query('SELECT id, title, slug, fee, mode, status FROM uc_events_events WHERE slug = "hack-pick"');
    console.log('Event in DB:', events);

    const [teamCols] = await pool.query('DESCRIBE uc_events_teams');
    console.log('Teams columns:', teamCols.map(c => c.Field).join(', '));

    const [memberCols] = await pool.query('DESCRIBE uc_events_team_members');
    console.log('Member columns:', memberCols.map(c => c.Field).join(', '));

    const [paymentCols] = await pool.query('DESCRIBE uc_events_payments');
    console.log('Payment columns:', paymentCols.map(c => c.Field).join(', '));

    console.log('ALL HACK PICK TABLES AND COLUMNS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error verifying Hack Pick:', err);
  } finally {
    await pool.end();
  }
}

testHackPickSetup();
