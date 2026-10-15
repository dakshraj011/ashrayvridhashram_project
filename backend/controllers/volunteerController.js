const db = require('../db/initDb');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const { isMongoReady } = require('../db/mongoConnect');

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

    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
    }

    const userId = req.user ? req.user.id : 0;

    const result = await db.query(
      `INSERT INTO volunteer_registrations (user_id, full_name, mobile, email, address, preferred_date, help_type, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'लंबित')`,
      [userId, full_name, cleanMobile, email || null, address || '', preferred_date, help_type, message || '']
    );

    // Save to MongoDB collection if connected
    if (isMongoReady()) {
      try {
        await VolunteerRegistration.create({
          full_name,
          mobile: cleanMobile,
          email: email || null,
          address: address || '',
          preferred_date,
          help_type,
          message: message || '',
          status: 'लंबित',
          user_id: userId,
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Volunteer registration saved to MongoDB: ${full_name} (${cleanMobile}) - ${help_type}`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Volunteer save notice:', mongoErr.message);
      }
    }

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

    let registrations = await db.query(sql, params).catch(() => []);
    if (!Array.isArray(registrations)) registrations = [];

    // Always merge with MongoDB if connected
    if (isMongoReady()) {
      try {
        const queryFilter = {};
        if (status) queryFilter.status = status;
        if (search) {
          queryFilter.$or = [
            { full_name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { help_type: { $regex: search, $options: 'i' } }
          ];
        }

        const mRegs = await VolunteerRegistration.find(queryFilter).sort({ createdAt: -1 }).lean();
        if (mRegs && mRegs.length > 0) {
          const mongoList = mRegs.map(v => ({
            id: v._id,
            full_name: v.full_name || v.fullName || 'स्वयंसेवक',
            mobile: v.mobile || '',
            email: v.email || '',
            address: v.address || '',
            preferred_date: v.preferred_date || v.preferredDate || '',
            help_type: v.help_type || v.helpType || 'सामान्य सेवा',
            message: v.message || '',
            status: v.status || 'लंबित',
            created_at: v.createdAt || new Date().toISOString()
          }));

          const seen = new Set(registrations.map(r => `${r.mobile}_${r.preferred_date}`));
          for (const vItem of mongoList) {
            const key = `${vItem.mobile}_${vItem.preferred_date}`;
            if (!seen.has(key)) {
              registrations.push(vItem);
              seen.add(key);
            }
          }
        }
      } catch (e) {
        console.warn('Mongo volunteers merge notice:', e.message);
      }
    }

    registrations.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

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

    let currentReg = await db.query(`SELECT * FROM volunteer_registrations WHERE id = ?`, [id]).catch(() => []);
    if ((!currentReg || currentReg.length === 0) && isMongoReady()) {
      try {
        const vDoc = await VolunteerRegistration.findById(id).lean();
        if (vDoc) {
          currentReg = [{
            id: vDoc._id,
            full_name: vDoc.full_name || vDoc.fullName,
            preferred_date: vDoc.preferred_date || vDoc.preferredDate,
            help_type: vDoc.help_type || vDoc.helpType,
            user_id: vDoc.user_id || 0,
            status: vDoc.status
          }];
        }
      } catch (e) {}
    }

    if (!currentReg || currentReg.length === 0) {
      return res.status(404).json({ success: false, message: 'स्वयंसेवक पंजीकरण नहीं मिला।' });
    }

    const oldStatus = currentReg[0].status;

    await db.query(
      `UPDATE volunteer_registrations SET status = ?, admin_note = ? WHERE id = ?`,
      [status, admin_note || null, id]
    ).catch(() => {});

    if (isMongoReady()) {
      try {
        if (typeof id === 'string' && id.length === 24) {
          await VolunteerRegistration.findByIdAndUpdate(id, { $set: { status } });
        } else {
          await VolunteerRegistration.updateOne(
            { $or: [{ legacy_id: parseInt(id, 10) }, { _id: id }] },
            { $set: { status } }
          );
        }
      } catch (mErr) {}
    }

    // Save history
    await db.query(
      `INSERT INTO request_status_history (request_type, request_id, previous_status, new_status, changed_by, notes)
       VALUES ('volunteer', ?, ?, ?, ?, ?)`,
      [id, oldStatus, status, req.user ? req.user.id : 1, admin_note || '']
    ).catch(() => {});

    // Notify user
    const notifMsg = status === 'स्वीकार किया गया' 
      ? `बधाई हो! ${currentReg[0].preferred_date} हेतु आपका ${currentReg[0].help_type} स्वयंसेवक आवेदन स्वीकृत कर लिया गया है।`
      : `आपके स्वयंसेवक पंजीकरण की स्थिति '${status}' कर दी गई है।`;

    if (currentReg[0].user_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'volunteer')`,
        [currentReg[0].user_id, `स्वयंसेवक आवेदन: ${status}`, notifMsg]
      ).catch(() => {});
    }

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
    await db.query('DELETE FROM volunteer_registrations WHERE id = ?', [id]).catch(() => {});
    if (isMongoReady()) {
      try {
        if (typeof id === 'string' && id.length === 24) {
          await VolunteerRegistration.findByIdAndDelete(id);
        } else {
          await VolunteerRegistration.deleteOne({ $or: [{ legacy_id: parseInt(id, 10) }, { _id: id }] });
        }
      } catch (mErr) {}
    }
    res.json({ success: true, message: 'स्वयंसेवक पंजीकरण रिकॉर्ड हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerVolunteer, getMyVolunteers, getAllVolunteers, updateVolunteerStatus, deleteVolunteer };

