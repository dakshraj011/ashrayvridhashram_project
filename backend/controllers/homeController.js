const db = require('../db/initDb');

// Get Home Info
const getHomeInfo = async (req, res) => {
  try {
    const records = await db.query('SELECT * FROM home_information WHERE id = 1');
    if (!records || records.length === 0) {
      return res.status(404).json({ success: false, message: 'आश्रम जानकारी उपलब्ध नहीं है' });
    }
    const info = records[0];

    // Safely parse JSON strings for facilities and about_images if needed
    try {
      if (typeof info.facilities === 'string') info.facilities = JSON.parse(info.facilities);
    } catch (e) { }
    try {
      if (typeof info.about_images === 'string') info.about_images = JSON.parse(info.about_images);
    } catch (e) { }

    res.json({ success: true, info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Home Info (Admin/Manager)
const updateHomeInfo = async (req, res) => {
  try {
    const { name, tagline, description, address, phone, email, facilities, hero_image, about_images } = req.body;

    const facilitiesStr = Array.isArray(facilities) ? JSON.stringify(facilities) : (facilities || '[]');
    const aboutImagesStr = Array.isArray(about_images) ? JSON.stringify(about_images) : (about_images || '[]');

    await db.query(
      `UPDATE home_information SET 
        name = ?, 
        tagline = ?, 
        description = ?, 
        address = ?, 
        phone = ?, 
        email = ?, 
        facilities = ?, 
        hero_image = ?, 
        about_images = ? 
      WHERE id = 1`,
      [name, tagline, description, address, phone, email, facilitiesStr, hero_image || null, aboutImagesStr]
    );

    res.json({ success: true, message: 'वृद्धाश्रम की जानकारी सफलतापूर्वक अपडेट कर दी गई है!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHomeInfo, updateHomeInfo };
