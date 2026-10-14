const db = require('../db/initDb');
const AssistanceRequest = require('../models/AssistanceRequest');
const { isMongoReady } = require('../db/mongoConnect');

// Submit Elderly Assistance Request
const createAssistanceRequest = async (req, res) => {
  try {
    const { elderly_name, elderly_age, contact_number, address, assistance_type, description, photo_url } = req.body;

    if (!elderly_name || !contact_number || !address || !assistance_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'कृपया बुजुर्ग का नाम, संपर्क नंबर, पता, सहायता का प्रकार और विवरण भरें।'
      });
    }

    const cleanContact = (contact_number || '').toString().trim().replace(/\D/g, '');
    if (cleanContact.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य संपर्क मोबाइल नंबर दर्ज करें।'
      });
    }

    const userId = req.user ? req.user.id : 0;

    const result = await db.query(
      `INSERT INTO assistance_requests (user_id, elderly_name, elderly_age, contact_number, address, assistance_type, description, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'लंबित')`,
      [userId, elderly_name, elderly_age ? parseInt(elderly_age, 10) : null, cleanContact, address, assistance_type, description, photo_url || null]
    );

    // Save to MongoDB collection if connected
    if (isMongoReady()) {
      try {
        await AssistanceRequest.create({
          elderly_name,
          elderly_age: elderly_age ? parseInt(elderly_age, 10) : null,
          contact_number: cleanContact,
          address,
          assistance_type,
          description,
          photo_url: photo_url || null,
          status: 'लंबित',
          user_id: userId,
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Assistance / Medicine request saved to MongoDB: ${elderly_name} (${cleanContact}) - ${assistance_type}`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Assistance save notice:', mongoErr.message);
      }
    }

    if (userId > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'assistance')`,
        [userId, 'बुजुर्ग सहायता अनुरोध दर्ज', `'${elderly_name}' की सहायता का आपका अनुरोध दर्ज कर लिया गया है। आश्रम टीम शीघ्र संपर्क करेगी।`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'बुजुर्ग सहायता का अनुरोध सफलतापूर्वक दर्ज कर लिया गया है!',
      requestId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Assistance Requests (User)
const getMyAssistanceRequests = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT * FROM assistance_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Assistance Requests (Admin/Manager)
const getAllAssistanceRequests = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let sql = `SELECT a.*, u.name as submitter_name, u.mobile as submitter_mobile, m.name as manager_name 
               FROM assistance_requests a 
               LEFT JOIN users u ON a.user_id = u.id 
               LEFT JOIN users m ON a.assigned_manager_id = m.id 
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (type) {
      sql += ` AND a.assistance_type = ?`;
      params.push(type);
    }
    if (search) {
      sql += ` AND (a.elderly_name LIKE ? OR a.contact_number LIKE ? OR a.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const requests = await db.query(sql, params);
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Assistance Request Status & Assign Manager
const updateAssistanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_manager_id, admin_note } = req.body;

    const currentReq = await db.query(`SELECT * FROM assistance_requests WHERE id = ?`, [id]);
    if (!currentReq || currentReq.length === 0) {
      return res.status(404).json({ success: false, message: 'सहायता अनुरोध नहीं मिला।' });
    }

    const oldStatus = currentReq[0].status;

    await db.query(
      `UPDATE assistance_requests SET status = ?, assigned_manager_id = ?, admin_note = ? WHERE id = ?`,
      [
        status || currentReq[0].status,
        assigned_manager_id !== undefined ? assigned_manager_id : currentReq[0].assigned_manager_id,
        admin_note || currentReq[0].admin_note,
        id
      ]
    );

    // Save history
    await db.query(
      `INSERT INTO request_status_history (request_type, request_id, previous_status, new_status, changed_by, notes)
       VALUES ('assistance', ?, ?, ?, ?, ?)`,
      [id, oldStatus, status || oldStatus, req.user.id, admin_note || '']
    );

    // Notify user
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'assistance')`,
      [currentReq[0].user_id, `बुजुर्ग सहायता स्थिति: ${status}`, `'${currentReq[0].elderly_name}' सहायता अनुरोध की स्थिति बदल कर '${status}' कर दी गई है।`]
    );

    res.json({
      success: true,
      message: 'सहायता अनुरोध की स्थिति एवं प्रबंधक आवंटन अपडेट कर दिया गया है।'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Elderly Assistance Request (Admin Only)
const deleteAssistanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM assistance_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'बुजुर्ग सहायता अनुरोध रिकॉर्ड हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAssistanceRequest, getMyAssistanceRequests, getAllAssistanceRequests, updateAssistanceStatus, deleteAssistanceRequest };

