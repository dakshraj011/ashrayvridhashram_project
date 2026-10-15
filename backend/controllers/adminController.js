const bcrypt = require('bcryptjs');
const db = require('../db/initDb');

const { isMongoReady } = require('../db/mongoConnect');
const MealRequest = require('../models/MealRequest');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const AssistanceRequest = require('../models/AssistanceRequest');
const ContactSubmission = require('../models/ContactSubmission');
const Need = require('../models/Need');

const safeCnt = (arr) => (Array.isArray(arr) && arr.length > 0 && arr[0]?.cnt != null) ? Number(arr[0].cnt) : 0;

// Get Real-time Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    let [
      userCount, managerCount, mealTotal, mealPending,
      volTotal, volPending, astTotal, astPending,
      contactCount, needCount, eventCount
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) as cnt FROM users WHERE role = 'user'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM users WHERE role = 'manager'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM meal_requests`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM meal_requests WHERE status = 'लंबित'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM volunteer_registrations`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM volunteer_registrations WHERE status = 'लंबित'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM assistance_requests`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM assistance_requests WHERE status = 'लंबित'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM contact_submissions`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM needs WHERE status = 'सक्रिय'`).catch(() => []),
      db.query(`SELECT COUNT(*) as cnt FROM events`).catch(() => [])
    ]);

    let totalMeals = safeCnt(mealTotal);
    let pendingMeals = safeCnt(mealPending);
    let totalVols = safeCnt(volTotal);
    let pendingVols = safeCnt(volPending);
    let totalAsts = safeCnt(astTotal);
    let pendingAsts = safeCnt(astPending);
    let totalContacts = safeCnt(contactCount);
    let activeNeeds = safeCnt(needCount);

    // If MongoDB is connected and has records, use MongoDB counts
    if (isMongoReady()) {
      try {
        const mMeals = await MealRequest.countDocuments();
        const mPendingMeals = await MealRequest.countDocuments({ status: 'लंबित' });
        const mVols = await VolunteerRegistration.countDocuments();
        const mPendingVols = await VolunteerRegistration.countDocuments({ status: 'लंबित' });
        const mAsts = await AssistanceRequest.countDocuments();
        const mPendingAsts = await AssistanceRequest.countDocuments({ status: 'लंबित' });
        const mContacts = await ContactSubmission.countDocuments();
        const mNeeds = await Need.countDocuments({ status: 'सक्रिय' });

        if (mMeals > totalMeals) totalMeals = mMeals;
        if (mPendingMeals > pendingMeals) pendingMeals = mPendingMeals;
        if (mVols > totalVols) totalVols = mVols;
        if (mPendingVols > pendingVols) pendingVols = mPendingVols;
        if (mAsts > totalAsts) totalAsts = mAsts;
        if (mPendingAsts > pendingAsts) pendingAsts = mPendingAsts;
        if (mContacts > totalContacts) totalContacts = mContacts;
        if (mNeeds > activeNeeds) activeNeeds = mNeeds;
      } catch (mErr) {
        console.warn('MongoDB stats count warning:', mErr.message);
      }
    }

    res.json({
      success: true,
      stats: {
        totalUsers: safeCnt(userCount) || 1,
        totalManagers: safeCnt(managerCount) || 1,
        totalMealRequests: totalMeals,
        pendingMealRequests: pendingMeals,
        totalVolunteers: totalVols,
        pendingVolunteers: pendingVols,
        totalAssistanceRequests: totalAsts,
        pendingAssistanceRequests: pendingAsts,
        totalContacts: totalContacts,
        activeNeeds: activeNeeds,
        totalEvents: safeCnt(eventCount)
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
