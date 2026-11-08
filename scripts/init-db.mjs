import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  console.log("Initializing UGHAM Events Database schema...");

  const connection = await mysql.createConnection({
    host: '192.169.147.255',
    port: 3306,
    user: 'MEAZHA',
    password: 'dZYRYi(o(0*U',
    database: 'le_test',
    connectTimeout: 15000,
  });

  try {
    // 1. uc_events_colleges
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_colleges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        city VARCHAR(150) NULL,
        state VARCHAR(150) DEFAULT 'Tamil Nadu',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_colleges ready");

    // 2. uc_events_categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_categories ready");

    // 3. uc_events_users (students)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        phone VARCHAR(25) NOT NULL,
        college_id INT NULL,
        college_name VARCHAR(255) NULL,
        profile_pic VARCHAR(500) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_users ready");

    // 4. uc_events_admin
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'superadmin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_admin ready");

    // 5. uc_events_events
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category_name VARCHAR(100) NOT NULL DEFAULT 'Seminar',
        description TEXT NOT NULL,
        short_description VARCHAR(500) NULL,
        event_date DATETIME NOT NULL,
        end_date DATETIME NULL,
        registration_deadline DATETIME NULL,
        venue VARCHAR(255) NOT NULL,
        mode ENUM('Offline', 'Online', 'Hybrid') DEFAULT 'Offline',
        poster_url VARCHAR(500) NULL,
        max_participants INT DEFAULT 0,
        fee DECIMAL(10,2) DEFAULT 0.00,
        organizer_name VARCHAR(200) NULL,
        organizer_contact VARCHAR(100) NULL,
        status ENUM('published', 'draft', 'cancelled', 'completed') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_event_date (event_date),
        INDEX idx_event_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_events ready");

    // 6. uc_events_registrations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(150) NULL,
        user_email VARCHAR(191) NULL,
        user_phone VARCHAR(25) NULL,
        user_college VARCHAR(255) NULL,
        status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
        notes TEXT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_event_user (event_id, user_id),
        INDEX idx_reg_event (event_id),
        INDEX idx_reg_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_registrations ready");

    // 7. uc_events_otp
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uc_events_otp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) DEFAULT 'password_reset',
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ Table uc_events_otp ready");

    // Seed Colleges
    const colleges = [
      ['PSG College of Technology', 'Coimbatore', 'Tamil Nadu'],
      ['Coimbatore Institute of Technology (CIT)', 'Coimbatore', 'Tamil Nadu'],
      ['Kumaraguru College of Technology (KCT)', 'Coimbatore', 'Tamil Nadu'],
      ['Government College of Technology (GCT)', 'Coimbatore', 'Tamil Nadu'],
      ['Sri Krishna College of Engineering and Technology (SKCET)', 'Coimbatore', 'Tamil Nadu'],
      ['College of Engineering, Guindy (CEG - Anna University)', 'Chennai', 'Tamil Nadu'],
      ['Madras Institute of Technology (MIT)', 'Chennai', 'Tamil Nadu'],
      ['SSN College of Engineering', 'Chennai', 'Tamil Nadu'],
      ['SRM Institute of Science and Technology', 'Chennai', 'Tamil Nadu'],
      ['Vellore Institute of Technology (VIT)', 'Vellore', 'Tamil Nadu'],
      ['National Institute of Technology (NIT Trichy)', 'Tiruchirappalli', 'Tamil Nadu'],
      ['Thiagarajar College of Engineering', 'Madurai', 'Tamil Nadu'],
      ['Bannari Amman Institute of Technology', 'Sathyamangalam', 'Tamil Nadu'],
      ['Kongu Engineering College', 'Perundurai', 'Tamil Nadu'],
      ['Amrita Vishwa Vidyapeetham', 'Coimbatore', 'Tamil Nadu'],
      ['Sona College of Technology', 'Salem', 'Tamil Nadu']
    ];

    for (const [name, city, state] of colleges) {
      await connection.query(
        `INSERT IGNORE INTO uc_events_colleges (name, city, state) VALUES (?, ?, ?)`,
        [name, city, state]
      );
    }
    console.log("✓ Seeded colleges");

    // Seed Categories
    const categories = [
      ['Hackathon', 'hackathon', 'Competitive coding, innovation sprints, and product building challenges.'],
      ['Seminar', 'seminar', 'Expert guest lectures, technical discussions, and industry talks.'],
      ['Workshop', 'workshop', 'Hands-on practical sessions and skill training.'],
      ['Symposium', 'symposium', 'Inter-college technical festivals, paper presentations, and competitions.'],
      ['Webinar', 'webinar', 'Virtual live interactive sessions and masterclasses.'],
      ['Conference', 'conference', 'Research symposiums, keynote presentations, and tech meetups.']
    ];

    for (const [name, slug, desc] of categories) {
      await connection.query(
        `INSERT IGNORE INTO uc_events_categories (name, slug, description) VALUES (?, ?, ?)`,
        [name, slug, desc]
      );
    }
    console.log("✓ Seeded categories");

    // Seed Default Admin: admin@ugham.com / admin@123
    const adminEmail = 'admin@ugham.com';
    const [existingAdmin] = await connection.query(
      `SELECT id FROM uc_events_admin WHERE email = ?`,
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      const hashedPass = await bcrypt.hash('admin@123', 10);
      await connection.query(
        `INSERT INTO uc_events_admin (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['UGHAM Admin', adminEmail, hashedPass, 'superadmin']
      );
      console.log("✓ Created default admin: admin@ugham.com / admin@123");
    }

    console.log("\n All database tables and initial data configured successfully!");
  } finally {
    await connection.end();
  }
}

initDatabase().catch(err => {
  console.error("Initialization failed:", err);
  process.exit(1);
});
