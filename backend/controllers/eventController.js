const db = require('../db/initDb');

// Get All Events & Grouped Gallery Photos for Public/Admin
const getEvents = async (req, res) => {
  try {
    const isPublic = !req.user || (req.user.role !== 'admin' && req.user.role !== 'manager');
    let sql = 'SELECT * FROM events';
    if (isPublic) {
      sql += ' WHERE is_published = 1';
    }
    sql += ' ORDER BY event_date DESC';

    const events = await db.query(sql);
    const gallery = await db.query('SELECT * FROM gallery_images ORDER BY created_at DESC');

    // Attach photos array to each event
    const eventsWithPhotos = events.map(evt => {
      const evtGallery = gallery.filter(g => g.event_id === evt.id).map(g => g.image_url);
      const allPhotos = [];
      if (evt.image_url) allPhotos.push(evt.image_url);
      evtGallery.forEach(url => {
        if (url && !allPhotos.includes(url)) allPhotos.push(url);
      });
      return {
        ...evt,
        photos: allPhotos.length > 0 ? allPhotos : [evt.image_url || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80']
      };
    });

    res.json({ success: true, events: eventsWithPhotos, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Event (Admin/Manager) with Multi-Photo Upload Support
const createEvent = async (req, res) => {
  try {
    const { title, event_date, description, image_url, images, is_published } = req.body;

    if (!title || !event_date || !description) {
      return res.status(400).json({ success: false, message: 'कृपया शीर्षक, तिथि और विवरण दर्ज करें।' });
    }

    // Determine photos (up to 5 photos)
    let photoList = [];
    if (Array.isArray(images) && images.length > 0) {
      photoList = images.filter(img => typeof img === 'string' && img.trim() !== '');
    } else if (typeof images === 'string' && images.trim() !== '') {
      photoList = images.split(',').map(s => s.trim()).filter(Boolean);
    } else if (image_url) {
      photoList = [image_url];
    }

    // Limit to at most 5 photos
    photoList = photoList.slice(0, 5);
    const primaryImage = photoList[0] || image_url || null;

    const result = await db.query(
      `INSERT INTO events (title, event_date, description, image_url, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, event_date, description, primaryImage, is_published !== undefined ? is_published : 1, req.user.id]
    );

    const eventId = result.insertId;

    // Insert all provided photos (up to 5) into gallery_images
    for (const imgUrl of photoList) {
      await db.query(
        `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, 'कार्यक्रम')`,
        [eventId, title, imgUrl]
      );
    }

    res.status(201).json({
      success: true,
      message: 'नया कार्यक्रम एवं तस्वीरें सफलतापूर्वक दर्ज की गईं!',
      eventId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Event (Admin/Manager)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, description, image_url, images, is_published } = req.body;

    const existing = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'कार्यक्रम नहीं मिला।' });
    }

    let photoList = [];
    if (Array.isArray(images) && images.length > 0) {
      photoList = images.filter(img => typeof img === 'string' && img.trim() !== '');
    } else if (typeof images === 'string' && images.trim() !== '') {
      photoList = images.split(',').map(s => s.trim()).filter(Boolean);
    }

    const primaryImage = photoList[0] || image_url || existing[0].image_url;

    await db.query(
      `UPDATE events SET title = ?, event_date = ?, description = ?, image_url = ?, is_published = ? WHERE id = ?`,
      [
        title || existing[0].title,
        event_date || existing[0].event_date,
        description || existing[0].description,
        primaryImage,
        is_published !== undefined ? is_published : existing[0].is_published,
        id
      ]
    );

    // If new photos provided, add them to gallery_images
    if (photoList.length > 0) {
      for (const imgUrl of photoList) {
        const check = await db.query(`SELECT * FROM gallery_images WHERE event_id = ? AND image_url = ?`, [id, imgUrl]);
        if (!check || check.length === 0) {
          await db.query(
            `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, 'कार्यक्रम')`,
            [id, title || existing[0].title, imgUrl]
          );
        }
      }
    }

    res.json({ success: true, message: 'कार्यक्रम का विवरण अपडेट कर दिया गया है।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM gallery_images WHERE event_id = ?', [id]);
    await db.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true, message: 'कार्यक्रम एवं संबंधित चित्र हटा दिए गए।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Gallery Image (Admin/Manager)
const addGalleryImage = async (req, res) => {
  try {
    const { title, image_url, category, event_id } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ success: false, message: 'शीर्षक एवं इमेज यूआरएल आवश्यक है।' });
    }

    await db.query(
      `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, ?)`,
      [event_id || null, title, image_url, category || 'गैलरी']
    );

    res.status(201).json({ success: true, message: 'गैलरी इमेज सफलतापूर्वक जोड़ी गई!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, addGalleryImage };
