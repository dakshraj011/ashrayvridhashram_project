const db = require('../db/initDb');

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

    const result = await db.query(
      `INSERT INTO contact_submissions (name, mobile, email, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'अपठित')`,
      [name, mobile, email || null, subject || 'सामान्य पूछताछ', message]
    );

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
    const messages = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json({ success: true, count: messages.length, messages });
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
