const db = require('../db/initDb');
const ContactSubmission = require('../models/ContactSubmission');
const { isMongoReady } = require('../db/mongoConnect');

// Submit Contact Form (Public)
const submitContact = async (req, res) => {
  try {
    const { name, mobile, email, subject, message } = req.body;

    if (!name || !mobile || !message) {
      return res.status(400).json({
        success: false,
        message: 'कृपया अपना नाम, मोबाइल नंबर और संदेश दर्ज करें।'
      });
    }

    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
    }

    const result = await db.query(
      `INSERT INTO contact_submissions (name, mobile, email, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'अपठित')`,
      [name, cleanMobile, email || null, subject || 'सामान्य पूछताछ', message]
    );

    // Save to MongoDB collection if connected
    if (isMongoReady()) {
      try {
        await ContactSubmission.create({
          name,
          mobile: cleanMobile,
          email: email || null,
          subject: subject || 'सामान्य पूछताछ',
          message,
          status: 'अपठित',
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Contact form submission saved to MongoDB: ${name} (${cleanMobile})`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Contact save notice:', mongoErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'आपका संदेश सफलतापूर्वक भेज दिया गया है! हम आपसे शीघ्र ही संपर्क करेंगे।',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Contact Submissions (Admin)
const getContacts = async (req, res) => {
  try {
    let messages = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC').catch(() => []);
    if ((!messages || messages.length === 0) && isMongoReady()) {
      try {
        const mMsgs = await ContactSubmission.find().sort({ createdAt: -1 }).lean();
        if (mMsgs && mMsgs.length > 0) {
          messages = mMsgs.map(c => ({
            id: c._id,
            name: c.name,
            mobile: c.mobile,
            email: c.email,
            subject: c.subject,
            message: c.message,
            status: c.status,
            created_at: c.createdAt
          }));
        }
      } catch (e) {}
    }
    res.json({ success: true, count: messages ? messages.length : 0, messages: messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Contact Status (Admin)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'अपठित', 'पठित', 'हल किया गया'

    await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `संदेश स्थिति बदलकर '${status}' कर दी गई है।` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Contact (Admin)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_submissions WHERE id = ?', [id]);
    res.json({ success: true, message: 'संदेश हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitContact, getContacts, updateContactStatus, deleteContact };
