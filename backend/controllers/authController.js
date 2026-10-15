const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/initDb');

// Register User
const register = async (req, res) => {
  try {
    const { name, mobile, email, password, address } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया नाम, मोबाइल नंबर और पासवर्ड दर्ज करें।'
      });
    }

    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
    }

    // Check existing user
    const existingUsers = await db.query(
      `SELECT * FROM users WHERE mobile = ? OR (email IS NOT NULL AND email != '' AND email = ?)`,
      [cleanMobile, email || '']
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'यह मोबाइल नंबर या ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, mobile, password, role, address, is_active) VALUES (?, ?, ?, ?, 'user', ?, 1)`,
      [name, email || null, cleanMobile, hashedPassword, address || '']
    );

    const userId = result.insertId;

    // Send welcome notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'general')`,
      [userId, 'पंजीकरण सफल', 'आश्रय पोर्टल पर आपका हार्दिक स्वागत है! राधे राधे।']
    );

    // Create JWT Token
    const token = jwt.sign(
      { id: userId, name, mobile, role: 'user', email: email || '' },
      process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'पंजीकरण सफलतापूर्वक संपन्न हुआ!',
      token,
      user: { id: userId, name, mobile, email: email || '', role: 'user', address: address || '' }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'पंजीकरण के दौरान त्रुटि हुई: ' + error.message
    });
  }
};

// Login User / Admin (Direct Admin Login via password 'radhe radhe')
const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया सुरक्षा पासवर्ड दर्ज करें।'
      });
    }

    const trimmedPassword = password.toString().trim();

    // 1. Direct Master Admin Login via password 'radhe radhe' (Single-Password Admin Access)
    if (trimmedPassword.toLowerCase() === 'radhe radhe') {
      let admin = null;
      try {
        const adminUsers = await db.query(`SELECT * FROM users WHERE role = 'admin' LIMIT 1`);
        if (adminUsers && adminUsers.length > 0) {
          admin = adminUsers[0];
        }
      } catch (e) {
        console.warn('Admin fetch fallback:', e.message);
      }

      if (!admin) {
        admin = {
          id: 1,
          name: 'मुख्य प्रशासक (Admin)',
          email: 'admin@aashray.org',
          mobile: '6306638958',
          role: 'admin',
          address: 'आश्रय धाम, स्टेशन रोड, उरई, जालौन (उत्तर प्रदेश)'
        };
      }

      const token = jwt.sign(
        { id: admin.id, name: admin.name, mobile: admin.mobile, role: 'admin', email: admin.email || '' },
        process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'प्रशासक लॉगिन सफल! जय श्री कृष्णा।',
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: 'admin',
          address: admin.address
        }
      });
    }

    // Direct password login without mobile
    if (!mobile) {
      try {
        const adminUsers = await db.query(`SELECT * FROM users WHERE role = 'admin'`);
        if (adminUsers && adminUsers.length > 0) {
          for (const a of adminUsers) {
            const isMatch = await bcrypt.compare(trimmedPassword, a.password);
            if (isMatch) {
              const token = jwt.sign(
                { id: a.id, name: a.name, mobile: a.mobile, role: 'admin', email: a.email || '' },
                process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure',
                { expiresIn: '7d' }
              );
              return res.json({
                success: true,
                message: 'प्रशासक लॉगिन सफल! जय श्री कृष्णा।',
                token,
                user: { id: a.id, name: a.name, email: a.email, mobile: a.mobile, role: 'admin', address: a.address }
              });
            }
          }
        }
      } catch (e) {}

      return res.status(401).json({
        success: false,
        message: 'गलत पासवर्ड! कृपया सही सुरक्षा पासवर्ड (radhe radhe) दर्ज करें।'
      });
    }

    // 2. Mobile + Password Login fallback
    const users = await db.query(
      `SELECT * FROM users WHERE mobile = ? OR email = ?`,
      [mobile, mobile]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'गलत मोबाइल नंबर या पासवर्ड। कृपया पुनः प्रयास करें।'
      });
    }

    const user = users[0];

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'आपका खाता निष्क्रिय कर दिया गया है। कृपया व्यवस्थापक से संपर्क करें।'
      });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'गलत पासवर्ड। कृपया पुनः प्रयास करें।'
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, mobile: user.mobile, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'aashray_krishna_prem_jwt_secret_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `स्वागत है, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'लॉगिन के दौरान त्रुटि हुई: ' + error.message
    });
  }
};

// Get Current Profile
const getMe = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, name, email, mobile, role, address, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    await db.query(
      `UPDATE users SET name = ?, email = ?, address = ? WHERE id = ?`,
      [name, email || null, address || '', req.user.id]
    );

    res.json({
      success: true,
      message: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!',
      user: { ...req.user, name, email, address }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
