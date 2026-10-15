const db = require('../db/initDb');
const Need = require('../models/Need');
const { isMongoReady } = require('../db/mongoConnect');

// Get all needs
const getNeeds = async (req, res) => {
  try {
    const { category, status } = req.query;
    let sql = 'SELECT * FROM needs WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    let needs = await db.query(sql, params).catch(() => []);
    if ((!needs || needs.length === 0) && isMongoReady()) {
      try {
        const mNeeds = await Need.find().sort({ createdAt: -1 }).lean();
        if (mNeeds && mNeeds.length > 0) {
          needs = mNeeds.map(n => ({
            id: n._id,
            title: n.title,
            category: n.category,
            description: n.description,
            required_quantity: n.requiredQuantity,
            available_quantity: n.availableQuantity,
            unit: n.unit,
            photo_url: n.photoUrl,
            status: n.status,
            created_at: n.createdAt
          }));
        }
      } catch (e) {}
    }
    res.json({ success: true, count: needs ? needs.length : 0, needs: needs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'आवश्यकताएँ लोड करने में विफलता: ' + error.message });
  }
};

// Add new need (Admin/Manager)
const createNeed = async (req, res) => {
  try {
    const { title, category, description, required_quantity, available_quantity, unit, photo_url } = req.body;

    if (!title || !category || !required_quantity) {
      return res.status(400).json({
        success: false,
        message: 'कृपया शीर्षक, श्रेणी और आवश्यक मात्रा प्रदान करें।'
      });
    }

    const result = await db.query(
      `INSERT INTO needs (title, category, description, required_quantity, available_quantity, unit, photo_url, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'सक्रिय', ?)`,
      [
        title,
        category,
        description || '',
        parseInt(required_quantity, 10),
        parseInt(available_quantity || 0, 10),
        unit || 'इकाई',
        photo_url || null,
        req.user.id
      ]
    );

    // Save to MongoDB collection if connected
    if (isMongoReady()) {
      try {
        await Need.create({
          title,
          category,
          description: description || '',
          required_quantity: parseInt(required_quantity, 10),
          available_quantity: parseInt(available_quantity || 0, 10),
          unit: unit || 'इकाई',
          photo_url: photo_url || null,
          status: 'सक्रिय',
          created_by: req.user.id,
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Need saved to MongoDB: ${title} (${category})`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Need save notice:', mongoErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'नई आवश्यकता सफलतापूर्वक जोड़ी गई!',
      needId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update need (Admin/Manager)
const updateNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, required_quantity, available_quantity, unit, photo_url, status } = req.body;

    const existing = await db.query('SELECT * FROM needs WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'आवश्यकता नहीं मिली' });
    }

    await db.query(
      `UPDATE needs SET 
        title = ?, 
        category = ?, 
        description = ?, 
        required_quantity = ?, 
        available_quantity = ?, 
        unit = ?, 
        photo_url = ?, 
        status = ? 
      WHERE id = ?`,
      [
        title || existing[0].title,
        category || existing[0].category,
        description !== undefined ? description : existing[0].description,
        required_quantity !== undefined ? parseInt(required_quantity, 10) : existing[0].required_quantity,
        available_quantity !== undefined ? parseInt(available_quantity, 10) : existing[0].available_quantity,
        unit || existing[0].unit,
        photo_url !== undefined ? photo_url : existing[0].photo_url,
        status || existing[0].status,
        id
      ]
    );

    res.json({ success: true, message: 'आवश्यकता का विवरण अपडेट कर दिया गया है।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete need (Admin only)
const deleteNeed = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM needs WHERE id = ?', [id]);
    res.json({ success: true, message: 'आवश्यकता हटा दी गई।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNeeds, createNeed, updateNeed, deleteNeed };
