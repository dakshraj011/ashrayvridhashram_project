const db = require('../db/initDb');

// Create Meal Sponsorship Request
const createMealRequest = async (req, res) => {
  try {
    const { preferred_date, people_count, meal_type, items_distributed, message, mobile, user_name } = req.body;

    if (!user_name || !mobile || !preferred_date || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'कृपया अपना नाम, मोबाइल नंबर, भोजन की तारीख और प्रकार दर्ज करें।'
      });
    }

    const userId = req.user ? req.user.id : 0;
    const name = user_name || (req.user ? req.user.name : '');
    const mob = mobile || (req.user ? req.user.mobile : '');
    const items = items_distributed || 'सात्विक भोजन, फल एवं मिष्ठान';

    const result = await db.query(
      `INSERT INTO meal_requests (user_id, user_name, mobile, preferred_date, people_count, meal_type, items_distributed, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'लंबित')`,
      [userId, name, mob, preferred_date, people_count || 50, meal_type, items, message || '']
    );

    // Add notification if logged-in user exists
    if (userId > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'meal')`,
        [userId, 'भोजन प्रायोजन अनुरोध प्राप्त हुआ', `${preferred_date} हेतु ${meal_type} का आपका अनुरोध प्राप्त हो गया है और समीक्षाधीन है।`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'भोजन प्रायोजन का अनुरोध सफलतापूर्वक दर्ज कर लिया गया है! अनुमोदन के पश्चात आपको सूचित किया जाएगा।',
      requestId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'त्रुटि: ' + error.message });
  }
};

// Get My Meal Requests (User)
const getMyMealRequests = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT * FROM meal_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Meal Requests (Admin/Manager)
const getAllMealRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `SELECT m.*, u.email FROM meal_requests m LEFT JOIN users u ON m.user_id = u.id WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND m.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (m.user_name LIKE ? OR m.mobile LIKE ? OR m.meal_type LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY m.created_at DESC`;

    const requests = await db.query(sql, params);
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Meal Request Status (Admin/Manager)
const updateMealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'कृपया स्थिति (Status) निर्दिष्ट करें।' });
    }

    const currentReq = await db.query(`SELECT * FROM meal_requests WHERE id = ?`, [id]);
    if (!currentReq || currentReq.length === 0) {
      return res.status(404).json({ success: false, message: 'भोजन अनुरोध नहीं मिला।' });
    }

    const oldStatus = currentReq[0].status;

    await db.query(
      `UPDATE meal_requests SET status = ?, admin_note = ? WHERE id = ?`,
      [status, admin_note || null, id]
    );

    // Save status history log
    await db.query(
      `INSERT INTO request_status_history (request_type, request_id, previous_status, new_status, changed_by, notes)
       VALUES ('meal', ?, ?, ?, ?, ?)`,
      [id, oldStatus, status, req.user.id, admin_note || '']
    );

    // Send notification to user
    const statusMsgHindi = {
      'स्वीकार किया गया': `आपका भोजन प्रायोजन अनुरोध (${currentReq[0].preferred_date} - ${currentReq[0].meal_type}) स्वीकार कर लिया गया है। साधुवाद!`,
      'अस्वीकार किया गया': `आपका भोजन प्रायोजन अनुरोध (${currentReq[0].preferred_date}) स्वीकार नहीं किया जा सका। कारण: ${admin_note || 'स्थान उपलब्ध नहीं'}`,
      'पूर्ण': `आपका भोजन प्रायोजन कार्य संपन्न हो चुका है। बुजुर्गों के आशीर्वाद हेतु धन्यवाद।`,
      'लंबित': `आपका भोजन प्रायोजन अनुरोध पुन: समीक्षाधीन (लंबित) स्थिति में है।`
    };

    const notifMsg = statusMsgHindi[status] || `आपके भोजन अनुरोध की स्थिति बदल कर '${status}' कर दी गई है।`;

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'meal')`,
      [currentReq[0].user_id, `भोजन अनुरोध स्थिति: ${status}`, notifMsg]
    );

    res.json({
      success: true,
      message: `भोजन अनुरोध की स्थिति बदल कर '${status}' कर दी गई है तथा उपयोगकर्ता को सूचित कर दिया गया है।`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Meal Request (Admin Only)
const deleteMealRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM meal_requests WHERE id = ?', [id]);
    res.json({ success: true, message: 'भोजन प्रायोजन अनुरोध रिकॉर्ड हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createMealRequest, getMyMealRequests, getAllMealRequests, updateMealStatus, deleteMealRequest };

