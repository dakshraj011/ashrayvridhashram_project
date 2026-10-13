const db = require('../db/initDb');

// Submit Volunteer Application
const registerVolunteer = async (req, res) => {
  try {
    const { full_name, mobile, email, address, preferred_date, help_type, message } = req.body;

    if (!full_name || !mobile || !preferred_date || !help_type) {
      return res.status(400).json({
        success: false,
        message: 'कृपया नाम, मोबाइल, पसंदीदा तिथि और सेवा का प्रकार भरें।'
      });
    }

    const userId = req.user ? req.user.id : 0;

    const result = await db.query(
      `INSERT INTO volunteer_registrations (user_id, full_name, mobile, email, address, preferred_date, help_type, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'लंबित')`,
      [userId, full_name, mobile, email || null, address || '', preferred_date, help_type, message || '']
    );

    if (userId > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'volunteer')`,
        [userId, 'स्वयंसेवक आवेदन प्राप्त हुआ', `${preferred_date} हेतु ${help_type} का आपका स्वयंसेवक पंजीकरण प्राप्त हो गया है।`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'स्वयंसेवक पंजीकरण का आपका आवेदन सफलतापूर्वक प्राप्त हो गया है! धन्यवाद।',
      volunteerId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Volunteer Registrations
const getMyVolunteers = async (req, res) => {
  try {
    const registrations = await db.query(
      `SELECT * FROM volunteer_registrations WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Volunteer Registrations (Admin/Manager)
const getAllVolunteers = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `SELECT * FROM volunteer_registrations WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (full_name LIKE ? OR mobile LIKE ? OR help_type LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const registrations = await db.query(sql, params);
    res.json({ success: true, count: registrations.length, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Volunteer Status (Admin/Manager)
const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const currentReg = await db.query(`SELECT * FROM volunteer_registrations WHERE id = ?`, [id]);
    if (!currentReg || currentReg.length === 0) {
      return res.status(404).json({ success: false, message: 'स्वयंसेवक पंजीकरण नहीं मिला।' });
    }

    const oldStatus = currentReg[0].status;

    await db.query(
      `UPDATE volunteer_registrations SET status = ?, admin_note = ? WHERE id = ?`,
      [status, admin_note || null, id]
    );

    // Save history
    await db.query(
      `INSERT INTO request_status_history (request_type, request_id, previous_status, new_status, changed_by, notes)
       VALUES ('volunteer', ?, ?, ?, ?, ?)`,
      [id, oldStatus, status, req.user.id, admin_note || '']
    );

    // Notify user
    const notifMsg = status === 'स्वीकार किया गया' 
      ? `बधाई हो! ${currentReg[0].preferred_date} हेतु आपका ${currentReg[0].help_type} स्वयंसेवक आवेदन स्वीकृत कर लिया गया है।`
      : `आपके स्वयंसेवक पंजीकरण की स्थिति '${status}' कर दी गई है।`;

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'volunteer')`,
      [currentReg[0].user_id, `स्वयंसेवक आवेदन: ${status}`, notifMsg]
    );

    res.json({
      success: true,
      message: `स्वयंसेवक आवेदन की स्थिति बदल कर '${status}' कर दी गई है।`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Volunteer Application (Admin Only)
const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM volunteer_registrations WHERE id = ?', [id]);
    res.json({ success: true, message: 'स्वयंसेवक पंजीकरण रिकॉर्ड हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerVolunteer, getMyVolunteers, getAllVolunteers, updateVolunteerStatus, deleteVolunteer };

