const db = require('../db/initDb');

// Get User Notifications (Personal + Broadcasts)
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifs = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    res.json({ success: true, count: notifs.length, notifications: notifs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: 'सूचना पढ़ी गई चिन्हित कर दी गई।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Broadcast Announcement (Admin/Manager)
const sendBroadcast = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'शीर्षक एवं संदेश आवश्यक हैं।' });
    }

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (NULL, ?, ?, 'announcement')`,
      [title, message]
    );

    res.status(201).json({ success: true, message: 'सार्वजनिक घोषणा सभी उपयोगकर्ताओं को भेज दी गई है!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, sendBroadcast };
