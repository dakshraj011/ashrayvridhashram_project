const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbDriver = 'sqlite'; // Default fallback driver
let mysqlPool = null;
let sqliteDb = null;

// Database helper object
const db = {
  driver: 'sqlite',

  async init() {
    const preferredDriver = (process.env.DB_DRIVER || '').toLowerCase();
    
    // Check if DATABASE_URL or individual DB params are present
    const rawUri = process.env.DATABASE_URL || process.env.MYSQL_URL || '';
    let dbHost = process.env.DB_HOST || '';
    let dbUser = process.env.DB_USER || 'root';
    let dbPassword = process.env.DB_PASSWORD || '';
    let dbName = process.env.DB_NAME || 'aashray_db';
    let dbPort = parseInt(process.env.DB_PORT || '3306', 10);
    let useSsl = process.env.DB_SSL === 'true';

    if (rawUri) {
      try {
        const parsed = new URL(rawUri);
        dbHost = parsed.hostname;
        dbPort = parseInt(parsed.port || '3306', 10);
        dbUser = decodeURIComponent(parsed.username || 'root');
        dbPassword = decodeURIComponent(parsed.password || '');
        dbName = (parsed.pathname || '/aashray_db').replace(/^\//, '') || 'aashray_db';
        if (parsed.searchParams.has('ssl-mode') || parsed.searchParams.has('ssl') || rawUri.includes('aivencloud.com')) {
          useSsl = true;
        }
      } catch (err) {
        console.warn('⚠️ [DB] Could not parse DATABASE_URL, using individual parameters:', err.message);
      }
    }

    if (!dbHost) {
      dbHost = 'localhost';
    }

    if (dbHost.includes('aivencloud.com') || (dbHost !== 'localhost' && dbHost !== '127.0.0.1')) {
      useSsl = true;
    }

    // If explicit sqlite driver requested, skip MySQL
    if (preferredDriver === 'sqlite') {
      console.log('🔄 [DB] DB_DRIVER is set to sqlite. Initializing embedded SQLite database (aashray.db)...');
      dbDriver = 'sqlite';
      this.driver = 'sqlite';
      await this.initSQLite();
      await this.ensureAdminUser();
      return;
    }

    // Try connecting to MySQL
    try {
      console.log(`[DB] Attempting MySQL connection to ${dbHost}:${dbPort}/${dbName} (SSL: ${useSsl ? 'Enabled' : 'Disabled'})...`);
      
      const connConfig = {
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        port: dbPort,
        connectTimeout: 8000
      };

      if (useSsl) {
        connConfig.ssl = { rejectUnauthorized: false };
      }

      // Try database creation if permissions allow
      try {
        const tempConn = await mysql.createConnection(connConfig);
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await tempConn.end();
      } catch (createDbErr) {
        // Cloud instances like Aiven restrict CREATE DATABASE, which is normal for dedicated pre-made databases
      }

      // Create pool with database
      const poolConfig = {
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        port: dbPort,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000
      };

      if (useSsl) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      mysqlPool = mysql.createPool(poolConfig);

      // Test pool connection
      const connection = await mysqlPool.getConnection();
      console.log('✅ [DB] Successfully connected to MySQL cloud database!');
      connection.release();

      dbDriver = 'mysql';
      this.driver = 'mysql';

      // Ensure tables exist in MySQL
      await this.initMySQLTables();
      await this.ensureAdminUser();
      return;
    } catch (err) {
      console.warn('⚠️ [DB] MySQL connection failed/unavailable:', err.message);
      console.log('🔄 [DB] Falling back to local embedded SQLite database (aashray.db)...');
      
      dbDriver = 'sqlite';
      this.driver = 'sqlite';
      await this.initSQLite();
      await this.ensureAdminUser();
    }
  },

  async initMySQLTables() {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('USE') && !s.startsWith('CREATE DATABASE'));

    for (const stmt of statements) {
      try {
        await mysqlPool.query(stmt);
      } catch (e) {
        // Ignore duplicate table errors
      }
    }

    // Check if seed needed
    const [rows] = await mysqlPool.query('SELECT COUNT(*) as cnt FROM users');
    if (rows[0].cnt === 0) {
      console.log('🌱 [DB] Seeding MySQL database...');
      await this.seedDatabase();
    }
  },

  async initSQLite() {
    const dbPath = path.join(__dirname, 'aashray.db');
    sqliteDb = new sqlite3.Database(dbPath);

    return new Promise((resolve, reject) => {
      sqliteDb.serialize(async () => {
        // Create tables for SQLite
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            address TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS home_information (
            id INTEGER PRIMARY KEY DEFAULT 1,
            name TEXT NOT NULL DEFAULT 'आश्रय वृद्धाश्रम',
            tagline TEXT DEFAULT 'वरिष्ठ नागरिकों का अपना स्नेहपूर्ण एवं सुरक्षित धाम',
            description TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            facilities TEXT,
            hero_image TEXT,
            about_images TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS needs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            required_quantity INTEGER NOT NULL DEFAULT 1,
            available_quantity INTEGER NOT NULL DEFAULT 0,
            unit TEXT DEFAULT 'इकाई',
            photo_url TEXT,
            status TEXT DEFAULT 'सक्रिय',
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS meal_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 0,
            user_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            preferred_date TEXT NOT NULL,
            people_count INTEGER DEFAULT 1,
            meal_type TEXT NOT NULL,
            items_distributed TEXT DEFAULT 'सात्विक भोजन',
            message TEXT,
            status TEXT DEFAULT 'लंबित',
            admin_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS volunteer_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 0,
            full_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT,
            address TEXT,
            preferred_date TEXT NOT NULL,
            help_type TEXT NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'लंबित',
            admin_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS assistance_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 0,
            elderly_name TEXT NOT NULL,
            elderly_age INTEGER,
            contact_number TEXT NOT NULL,
            address TEXT NOT NULL,
            assistance_type TEXT NOT NULL,
            description TEXT NOT NULL,
            photo_url TEXT,
            assigned_manager_id INTEGER,
            status TEXT DEFAULT 'लंबित',
            admin_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            event_date TEXT NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT,
            is_published INTEGER DEFAULT 1,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS gallery_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            title TEXT NOT NULL,
            image_url TEXT NOT NULL,
            category TEXT DEFAULT 'सामान्य',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'अपठित',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'general',
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS request_status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_type TEXT NOT NULL,
            request_id INTEGER NOT NULL,
            previous_status TEXT,
            new_status TEXT NOT NULL,
            changed_by INTEGER,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Check if seeding needed
        sqliteDb.get("SELECT COUNT(*) as cnt FROM users", async (err, row) => {
          if (err || row.cnt === 0) {
            console.log('🌱 [DB] Seeding local SQLite database...');
            await db.seedDatabase();
          }
          console.log('✅ [DB] SQLite database initialized and ready!');
          resolve();
        });
      });
    });
  },

  async seedDatabase() {
    const adminPasswordHash = await bcrypt.hash('radhe radhe', 10);
    const mgrHash = await bcrypt.hash('manager123', 10);

    await this.query(
      `INSERT INTO users (id, name, email, mobile, password, role, address, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 'मुख्य प्रशासक (Admin)', 'admin@aashray.org', '6306638958', adminPasswordHash, 'admin', 'आश्रय धाम, स्टेशन रोड, उरई, जालौन (उत्तर प्रदेश)', 1]
    );

    await this.query(
      `INSERT INTO users (id, name, email, mobile, password, role, address, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 'राजेश शर्मा (प्रबंधक)', 'rajesh@aashray.org', '9876543211', mgrHash, 'manager', 'उरई, जालौन', 1]
    );

    const facilitiesJson = JSON.stringify([
      "24x7 स्वास्थ्य देखभाल एवं डॉक्टर परामर्श",
      "सात्विक एवं पौष्टिक भोजन",
      "वातानुकूलित (AC) और आरामदायक कमरे",
      "दैनिक योग, ध्यान एवं श्री कृष्ण संकीर्तन",
      "पुस्तकालय एवं मनोरंजन कक्ष",
      "धार्मिक एवं सांस्कृतिक यात्राएँ"
    ]);

    const aboutImagesJson = JSON.stringify([
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
    ]);

    await this.query(
      `INSERT INTO home_information (id, name, tagline, description, address, phone, email, facilities, hero_image, about_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        'आश्रय वृद्धाश्रम',
        'वरिष्ठ नागरिकों का अपना स्नेहपूर्ण एवं सुरक्षित धाम',
        'आश्रय वृद्धाश्रम उरई (जालौन) में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है। यहाँ बुजुर्गों को सात्विक भोजन, नियमित स्वास्थ्य देखभाल, योगाभ्यास, भक्ति भजन और आत्मीय परिवार जैसा वातावरण प्रदान किया जाता है।',
        '108, आश्रय धाम, स्टेशन रोड, उरई - 285001, जिला जालौन (उत्तर प्रदेश)',
        '+91 6306638958 / 05162-250108',
        'info@aashray.org',
        facilitiesJson,
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
        aboutImagesJson
      ]
    );

    await this.query(
      `INSERT INTO needs (id, title, category, description, required_quantity, available_quantity, unit, photo_url, status, created_by) VALUES 
      (1, ?, ?, ?, ?, ?, ?, ?, ?, 1),
      (2, ?, ?, ?, ?, ?, ?, ?, ?, 1),
      (3, ?, ?, ?, ?, ?, ?, ?, ?, 2),
      (4, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        'सर्दियों के लिए गर्म कंबल एवं चादरें', 'कपड़े', 'आश्रम के 45 बुजुर्ग निवासियों के लिए सर्दियों हेतु ऊनी कंबल और कॉटन चादरों की आवश्यकता है।', 50, 15, 'नग', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80', 'सक्रिय',
        'दैनिक मधुमेह एवं बीपी की दवाइयाँ', 'दवाइयाँ', 'बुजुर्गों के नियमित स्वास्थ्य परीक्षण और मासिक दवाओं के लिए सहायता।', 100, 40, 'पैकेट', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 'सक्रिय',
        'कमरों के लिए खड़े पंखे (Stand Fans)', 'पंखे', 'गर्मी के मौसम में बुजुर्गों के विश्राम कक्षों के लिए वाटर कूलिंग स्टैंड फैन्स।', 10, 4, 'नग', 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?auto=format&fit=crop&w=600&q=80', 'सक्रिय',
        'सात्विक भोजन सामग्री (आटा, चावल, दाल)', ' भोजन', 'मासिक रसोई हेतु शुद्ध देसी घी, बासमती चावल, अरहर दाल और गेहूं के आटे की रसद।', 200, 120, 'किलो', 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=600&q=80', 'सक्रिय'
      ]
    );

    await this.query(
      `INSERT INTO events (id, title, event_date, description, image_url, is_published, created_by) VALUES
      (1, ?, ?, ?, ?, 1, 1),
      (2, ?, ?, ?, ?, 1, 1),
      (3, ?, ?, ?, ?, 1, 2)`,
      [
        'श्री कृष्ण जन्माष्टमी उत्सव एवं महाप्रसाद', '2026-08-25', 'आश्रय परिसर में बाबाओं और माताओं द्वारा कृष्ण भजन संध्या, झांकी एवं 56 भोग महाप्रसाद वितरण समारोह।', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
        'निःशुल्क नेत्र जांच एवं स्वास्थ्य शिविर', '2026-09-15', 'प्रसिद्ध नेत्र विशेषज्ञों द्वारा आश्रम के सभी बुजुर्गों की आँखों की जांच और निःशुल्क चश्मों का वितरण।', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        'दीपावली स्नेहमिलन एवं दीपदान उत्सव', '2026-11-01', 'आश्रम के प्रांगण में 1100 मिट्टी के दीयों से रोशनी और बुजुर्गों संग आनंदमयी दीवाली उत्सव।', 'https://images.unsplash.com/photo-1574269909862-7e4d705a4d08?auto=format&fit=crop&w=800&q=80'
      ]
    );

    await this.query(
      `INSERT INTO meal_requests (id, user_id, user_name, mobile, preferred_date, people_count, meal_type, message, status) VALUES
      (1, 3, ?, ?, ?, 50, ?, ?, ?)`,
      ['अमित कुमार (दानदाता)', '9876543212', '2026-10-15', 'दोपहर का भोजन', 'मेरे पिताजी के जन्मदिन के पावन अवसर पर सभी बुजुर्गों को विशेष खीर-पूरी का भोजन।', 'लंबित']
    );

    await this.query(
      `INSERT INTO volunteer_registrations (id, user_id, full_name, mobile, email, address, preferred_date, help_type, message, status) VALUES
      (1, 3, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['अमित कुमार', '9876543212', 'amit@gmail.com', 'जयपुर', '2026-10-15', 'भोजन वितरण', 'रविवार को बुजुर्गों को भोजन परोसने और उनके साथ संवाद करने का अवसर चाहिए।', 'स्वीकार किया गया']
    );

    await this.query(
      `INSERT INTO assistance_requests (id, user_id, elderly_name, elderly_age, contact_number, address, assistance_type, description, status) VALUES
      (1, 3, ?, 72, ?, ?, ?, ?, ?)`,
      ['रामलाल जी (उम्र 72)', '9876500000', 'मथुरा स्टेशन के पास', 'भोजन', 'वृद्ध व्यक्ति बेघर हैं और उन्हें नियमित भोजन तथा आश्रय की तत्काल आवश्यकता है।', 'लंबित']
    );

    await this.query(
      `INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
      (3, ?, ?, 'general', 0),
      (3, ?, ?, 'volunteer', 0)`,
      [
        'पंजीकरण सफल', 'आश्रय पोर्टल पर आपका हार्दिक स्वागत है! राधे राधे।',
        'स्वयंसेवक आवेदन स्वीकृत', 'आपका भोजन वितरण स्वयंसेवक आवेदन स्वीकार कर लिया गया है।'
      ]
    );

    console.log('✅ [DB] Initial seed data inserted!');
  },

  async ensureAdminUser() {
    try {
      const adminPasswordHash = await bcrypt.hash('radhe radhe', 10);
      const existingAdmin = await this.query('SELECT * FROM users WHERE mobile = ? OR role = ?', ['6306638958', 'admin']);
      if (existingAdmin && existingAdmin.length > 0) {
        await this.query(
          `UPDATE users SET name = ?, mobile = ?, password = ?, role = 'admin', is_active = 1 WHERE id = ?`,
          ['मुख्य प्रशासक (Admin)', '6306638958', adminPasswordHash, existingAdmin[0].id]
        );
      } else {
        await this.query(
          `INSERT INTO users (name, email, mobile, password, role, address, is_active) VALUES (?, ?, ?, ?, 'admin', ?, 1)`,
          ['मुख्य प्रशासक (Admin)', 'admin@aashray.org', '6306638958', adminPasswordHash, 'आश्रय धाम, उरई (जालौन)']
        );
      }

      // Update home_information table to Orai, Jalaun
      await this.query(
        `UPDATE home_information SET address = ?, description = ?, phone = ? WHERE id = 1`,
        [
          '108, आश्रय धाम, स्टेशन रोड, उरई - 285001, जिला जालौन (उत्तर प्रदेश)',
          'आश्रय वृद्धाश्रम उरई (जालौन) में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है। यहाँ बुजुर्गों को सात्विक भोजन, नियमित स्वास्थ्य देखभाल, योगाभ्यास, भक्ति भजन और आत्मीय परिवार जैसा वातावरण प्रदान किया जाता है।',
          '+91 6306638958 / 05162-250108'
        ]
      );

      // Ensure items_distributed column exists in meal_requests
      try {
        await this.query(`ALTER TABLE meal_requests ADD COLUMN items_distributed TEXT DEFAULT 'सात्विक भोजन'`);
      } catch (colErr) {
        // column already exists
      }

      console.log('🔑 [DB] Admin user & Orai (Jalaun) location details verified!');
    } catch (e) {
      console.error('Error ensuring admin user & location:', e.message);
    }
  },

  // Unified Query Helper (Works seamlessly for MySQL & SQLite)
  async query(sql, params = []) {
    if (this.driver === 'mysql') {
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        const trimmed = sql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT')) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
        } else if (trimmed.startsWith('INSERT')) {
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ insertId: this.lastID, affectedRows: this.changes });
          });
        } else {
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ affectedRows: this.changes });
          });
        }
      });
    }
  }
};

module.exports = db;
