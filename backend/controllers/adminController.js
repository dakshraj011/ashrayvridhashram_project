const bcrypt = require('bcryptjs');
const db = require('../db/initDb');

// Get Real-time Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const userCount = await db.query(`SELECT COUNT(*) as cnt FROM users WHERE role = 'user'`);
    const managerCount = await db.query(`SELECT COUNT(*) as cnt FROM users WHERE role = 'manager'`);
    
    const mealTotal = await db.query(`SELECT COUNT(*) as cnt FROM meal_requests`);
    const mealPending = await db.query(`SELECT COUNT(*) as cnt FROM meal_requests WHERE status = 'लंबित'`);
    
    const volTotal = await db.query(`SELECT COUNT(*) as cnt FROM volunteer_registrations`);
    const volPending = await db.query(`SELECT COUNT(*) as cnt FROM volunteer_registrations WHERE status = 'लंबित'`);

    const astTotal = await db.query(`SELECT COUNT(*) as cnt FROM assistance_requests`);
    const astPending = await db.query(`SELECT COUNT(*) as cnt FROM assistance_requests WHERE status = 'लंबित'`);

    const contactCount = await db.query(`SELECT COUNT(*) as cnt FROM contact_submissions`);
    const needCount = await db.query(`SELECT COUNT(*) as cnt FROM needs WHERE status = 'सक्रिय'`);
    const eventCount = await db.query(`SELECT COUNT(*) as cnt FROM events`);

    res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].cnt,
        totalManagers: managerCount[0].cnt,
        totalMealRequests: mealTotal[0].cnt,
        pendingMealRequests: mealPending[0].cnt,
        totalVolunteers: volTotal[0].cnt,
        pendingVolunteers: volPending[0].cnt,
        totalAssistanceRequests: astTotal[0].cnt,
        pendingAssistanceRequests: astPending[0].cnt,
        totalContacts: contactCount[0].cnt,
        activeNeeds: needCount[0].cnt,
        totalEvents: eventCount[0].cnt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users (with search)
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = `SELECT id, name, email, mobile, role, address, is_active, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }
    if (search) {
      sql += ` AND (name LIKE ? OR mobile LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const users = await db.query(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Manager Account (Admin only)
const addManager = async (req, res) => {
  try {
    const { name, mobile, email, password, address } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'कृपया नाम, मोबाइल नंबर और पासवर्ड दर्ज करें।' });
    }

    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' });
    }

    const existing = await db.query(`SELECT * FROM users WHERE mobile = ?`, [cleanMobile]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'यह मोबाइल नंबर पहले से पंजीकृत है।' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, mobile, password, role, address, is_active) VALUES (?, ?, ?, ?, 'manager', ?, 1)`,
      [name, email || null, cleanMobile, hashedPassword, address || '']
    );

    res.status(201).json({
      success: true,
      message: 'नया प्रबंधक खाता सफलतापूर्वक बनाया गया!',
      managerId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle User/Manager Active Status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await db.query(`UPDATE users SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, id]);
    res.json({
      success: true,
      message: `उपयोगकर्ता खाता ${is_active ? 'सक्रिय' : 'निष्क्रिय'} कर दिया गया है।`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'आप स्वयं अपना एडमिन खाता नहीं हटा सकते।' });
    }

    await db.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'उपयोगकर्ता सफलतापूर्वक हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync Data with MongoDB
const { syncSqliteToMongo } = require('../utils/syncMongo');
const { getMongoStatus } = require('../db/mongoConnect');

const syncMongoData = async (req, res) => {
  try {
    const result = await syncSqliteToMongo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMongoInfo = (req, res) => {
  res.json({ success: true, mongo: getMongoStatus() });
};

module.exports = {
  getDashboardStats,
  getUsers,
  addManager,
  toggleUserStatus,
  deleteUser,
  syncMongoData,
  getMongoInfo
};
