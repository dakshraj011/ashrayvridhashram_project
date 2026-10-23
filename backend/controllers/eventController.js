const db = require('../db/initDb');
const Event = require('../models/Event');
const GalleryImage = require('../models/GalleryImage');
const { isMongoReady } = require('../db/mongoConnect');

// Get All Events & Grouped Gallery Photos for Public/Admin
const getEvents = async (req, res) => {
  try {
    const isPublic = !req.user || (req.user.role !== 'admin' && req.user.role !== 'manager');
    let sql = 'SELECT * FROM events';
    if (isPublic) {
      sql += ' WHERE is_published = 1';
    }
    sql += ' ORDER BY event_date DESC';

    let events = await db.query(sql).catch(() => []);
    if (!Array.isArray(events)) events = [];

    let gallery = await db.query('SELECT * FROM gallery_images ORDER BY created_at DESC').catch(() => []);
    if (!Array.isArray(gallery)) gallery = [];

    // If MongoDB is connected, fetch and merge permanent cloud data
    if (isMongoReady()) {
      try {
        const mEvents = await Event.find(isPublic ? { is_published: 1 } : {}).sort({ event_date: -1 }).lean();
        const mGallery = await GalleryImage.find().sort({ createdAt: -1 }).lean();

        if (mEvents && mEvents.length > 0) {
          const seenEventKeys = new Set(
            events.map(e => `${(e.title || '').trim().toLowerCase()}_${String(e.event_date || '').split('T')[0]}`)
          );

          for (const me of mEvents) {
            const dateStr = String(me.event_date || '').split('T')[0];
            const key = `${(me.title || '').trim().toLowerCase()}_${dateStr}`;
            if (!seenEventKeys.has(key)) {
              events.push({
                id: me.legacy_id || me._id.toString(),
                title: me.title,
                event_date: dateStr,
                description: me.description,
                image_url: me.image_url,
                photos: Array.isArray(me.photos) ? me.photos : (me.image_url ? [me.image_url] : []),
                is_published: me.is_published !== undefined ? me.is_published : 1,
                created_by: me.created_by || 1,
                created_at: me.createdAt || new Date().toISOString()
              });
              seenEventKeys.add(key);
            }
          }
        }

        if (mGallery && mGallery.length > 0) {
          const seenImageUrls = new Set(gallery.map(g => (g.image_url || '').trim()));
          for (const mg of mGallery) {
            const url = (mg.image_url || '').trim();
            if (url && !seenImageUrls.has(url)) {
              gallery.push({
                id: mg.legacy_id || mg._id.toString(),
                event_id: mg.event_id || null,
                title: mg.title,
                image_url: mg.image_url,
                category: mg.category || 'कार्यक्रम',
                created_at: mg.createdAt || new Date().toISOString()
              });
              seenImageUrls.add(url);
            }
          }
        }
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Event & Gallery fetch notice:', mongoErr.message);
      }
    }

    // Attach photos array to each event
    const eventsWithPhotos = events.map(evt => {
      const evtId = evt.id != null ? String(evt.id) : '';
      const evtGallery = gallery.filter(g => String(g.event_id || '') === evtId).map(g => g.image_url);

      const allPhotos = [];
      if (Array.isArray(evt.photos)) {
        evt.photos.forEach(u => {
          if (u && !allPhotos.includes(u)) allPhotos.push(u);
        });
      }
      if (evt.image_url && !allPhotos.includes(evt.image_url)) {
        allPhotos.unshift(evt.image_url);
      }
      evtGallery.forEach(url => {
        if (url && !allPhotos.includes(url)) allPhotos.push(url);
      });

      return {
        ...evt,
        event_date: String(evt.event_date || '').split('T')[0],
        photos: allPhotos.length > 0
          ? allPhotos
          : [evt.image_url || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80']
      };
    });

    eventsWithPhotos.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    res.json({ success: true, events: eventsWithPhotos, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Event (Admin/Manager) with Multi-Photo Upload & Permanent MongoDB Storage
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

    photoList = photoList.slice(0, 5);
    const primaryImage = photoList[0] || image_url || null;
    const cleanDate = String(event_date).split('T')[0];
    const pubStatus = is_published !== undefined ? is_published : 1;
    const userId = req.user ? req.user.id : 1;

    // 1. Insert into SQL database
    const result = await db.query(
      `INSERT INTO events (title, event_date, description, image_url, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, cleanDate, description, primaryImage, pubStatus, userId]
    );

    const eventId = result.insertId;

    // 2. Insert photos into SQL gallery_images
    for (const imgUrl of photoList) {
      await db.query(
        `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, 'कार्यक्रम')`,
        [eventId, title, imgUrl]
      );
    }

    // 3. Save permanently to MongoDB Atlas if connected
    if (isMongoReady()) {
      try {
        await Event.create({
          title,
          event_date: cleanDate,
          description,
          image_url: primaryImage,
          photos: photoList,
          is_published: pubStatus,
          created_by: userId,
          legacy_id: eventId
        });

        for (const imgUrl of photoList) {
          await GalleryImage.create({
            event_id: eventId,
            title,
            image_url: imgUrl,
            category: 'कार्यक्रम',
            legacy_id: eventId
          });
        }
        console.log(`🍃 [MongoDB] Event '${title}' with ${photoList.length} photos saved permanently to MongoDB Atlas!`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Event save notice:', mongoErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'नया कार्यक्रम एवं तस्वीरें सफलतापूर्वक सहेज दी गईं!',
      eventId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Standalone Gallery Image (Admin/Manager) with Permanent MongoDB Storage
const addGalleryImage = async (req, res) => {
  try {
    const { title, image_url, category, event_id } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ success: false, message: 'शीर्षक एवं इमेज यूआरएल आवश्यक है।' });
    }

    const cat = category || 'गैलरी';
    const evtId = event_id || null;

    // 1. Save to SQL database
    const result = await db.query(
      `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, ?)`,
      [evtId, title, image_url, cat]
    );

    // 2. Save permanently to MongoDB Atlas if connected
    if (isMongoReady()) {
      try {
        await GalleryImage.create({
          event_id: evtId,
          title,
          image_url,
          category: cat,
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Gallery photo '${title}' saved permanently to MongoDB Atlas!`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Gallery photo save notice:', mongoErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'गैलरी तस्वीर सफलतापूर्वक सहेजी गई!',
      id: result.insertId
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
    const cleanDate = event_date ? String(event_date).split('T')[0] : existing[0].event_date;
    const newTitle = title || existing[0].title;
    const newDesc = description || existing[0].description;
    const pubStatus = is_published !== undefined ? is_published : existing[0].is_published;

    await db.query(
      `UPDATE events SET title = ?, event_date = ?, description = ?, image_url = ?, is_published = ? WHERE id = ?`,
      [newTitle, cleanDate, newDesc, primaryImage, pubStatus, id]
    );

    // Insert new photos into gallery_images
    if (photoList.length > 0) {
      for (const imgUrl of photoList) {
        const check = await db.query(`SELECT * FROM gallery_images WHERE event_id = ? AND image_url = ?`, [id, imgUrl]);
        if (!check || check.length === 0) {
          await db.query(
            `INSERT INTO gallery_images (event_id, title, image_url, category) VALUES (?, ?, ?, 'कार्यक्रम')`,
            [id, newTitle, imgUrl]
          );
        }
      }
    }

    // Update in MongoDB
    if (isMongoReady()) {
      try {
        await Event.findOneAndUpdate(
          { $or: [{ legacy_id: id }, { title: existing[0].title }] },
          {
            title: newTitle,
            event_date: cleanDate,
            description: newDesc,
            image_url: primaryImage,
            photos: photoList.length > 0 ? photoList : undefined,
            is_published: pubStatus
          }
        );
      } catch (mErr) {
        console.warn('⚠️ [MongoDB] Event update notice:', mErr.message);
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

    if (isMongoReady()) {
      try {
        await Event.deleteMany({ $or: [{ legacy_id: id }, { _id: id }] });
        await GalleryImage.deleteMany({ $or: [{ event_id: id }, { legacy_id: id }] });
      } catch (mErr) {
        console.warn('⚠️ [MongoDB] Event delete notice:', mErr.message);
      }
    }

    res.json({ success: true, message: 'कार्यक्रम एवं संबंधित चित्र हटा दिए गए।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Individual Gallery Image
const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM gallery_images WHERE id = ?', [id]);

    if (isMongoReady()) {
      try {
        await GalleryImage.deleteMany({ $or: [{ legacy_id: id }, { _id: id }] });
      } catch (mErr) {
        console.warn('⚠️ [MongoDB] Gallery delete notice:', mErr.message);
      }
    }

    res.json({ success: true, message: 'गैलरी तस्वीर हटा दी गई।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  addGalleryImage,
  deleteGalleryImage
};
