const db = require('../db/initDb');
const MealRequest = require('../models/MealRequest');
const { isMongoReady } = require('../db/mongoConnect');

// Helper to normalize date strings to YYYY-MM-DD
const normalizeDateStr = (d) => {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d).split('T')[0];
};

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

    const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
    }

    const formattedDate = normalizeDateStr(preferred_date);

    // Check if slot is already booked/full on preferred_date
    const activeBookings = await db.query(
      `SELECT meal_type, preferred_date, user_name FROM meal_requests 
       WHERE (preferred_date = ? OR DATE(preferred_date) = DATE(?)) 
       AND status != 'अस्वीकार किया गया'`,
      [formattedDate, formattedDate]
    );

    const bookedMealTypes = (activeBookings || []).map(b => b.meal_type);

    let isConflict = false;
    let conflictReason = '';

    if (bookedMealTypes.includes('पूरे दिन का भोजन')) {
      isConflict = true;
      conflictReason = `क्षमा करें, ${formattedDate} को पूरे दिन का भोजन वितरण स्लॉट पहले से ही बुक/फुल है। कृपया कोई अन्य तारीख चुनें।`;
    } else if (meal_type === 'पूरे दिन का भोजन' && bookedMealTypes.length > 0) {
      isConflict = true;
      conflictReason = `क्षमा करें, ${formattedDate} को अन्य भोजन स्लॉट (${bookedMealTypes.join(', ')}) पहले से बुक हैं, अतः पूरे दिन का स्लॉट उपलब्ध नहीं है। कृपया कोई अन्य स्लॉट या तारीख चुनें।`;
    } else if (bookedMealTypes.includes(meal_type)) {
      isConflict = true;
      conflictReason = `क्षमा करें, ${formattedDate} को '${meal_type}' का स्लॉट पहले से ही किसी अन्य व्यक्ति द्वारा बुक/फुल हो चुका है। कृपया कोई अन्य स्लॉट या तारीख चुनें।`;
    }

    if (isConflict) {
      return res.status(409).json({
        success: false,
        message: conflictReason
      });
    }

    let parsedCount = 0;
    if (people_count !== undefined && people_count !== null && people_count !== '') {
      const num = parseInt(people_count, 10);
      parsedCount = isNaN(num) ? 0 : num;
    }

    if (parsedCount < 0 || parsedCount > 200) {
      return res.status(400).json({
        success: false,
        message: 'व्यक्तियों/बुजुर्गों की संख्या 0 से 200 के बीच होनी चाहिए।'
      });
    }

    const userId = req.user ? req.user.id : 0;
    const name = user_name || (req.user ? req.user.name : '');
    const mob = cleanMobile;
    const items = items_distributed || 'सात्विक भोजन, फल एवं मिष्ठान';

    const result = await db.query(
      `INSERT INTO meal_requests (user_id, user_name, mobile, preferred_date, people_count, meal_type, items_distributed, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'लंबित')`,
      [userId, name, mob, formattedDate, parsedCount, meal_type, items, message || '']
    );

    // Save to MongoDB collection if connected
    if (isMongoReady()) {
      try {
        await MealRequest.create({
          user_name: name,
          mobile: mob,
          preferred_date: formattedDate,
          meal_type,
          people_count: parsedCount,
          items_distributed: items,
          message: message || '',
          status: 'लंबित',
          user_id: userId,
          legacy_id: result.insertId
        });
        console.log(`🍃 [MongoDB] Food distribution request saved to MongoDB: ${name} (${mob}) - ${formattedDate} (${meal_type})`);
      } catch (mongoErr) {
        console.warn('⚠️ [MongoDB] Meal save notice:', mongoErr.message);
      }
    }

    // Add notification if logged-in user exists
    if (userId > 0) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'meal')`,
        [userId, 'भोजन प्रायोजन अनुरोध प्राप्त हुआ', `${formattedDate} हेतु ${meal_type} का आपका अनुरोध प्राप्त हो गया है और समीक्षाधीन है।`]
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
    let requests = await db.query(
      `SELECT * FROM meal_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    ).catch(() => []);
    if (!Array.isArray(requests)) requests = [];

    // If Mongo is active, fetch user's meal requests from Mongo as well
    if (isMongoReady()) {
      try {
        const mDocs = await MealRequest.find({
          $or: [
            { user_id: req.user.id },
            { mobile: req.user.mobile }
          ]
        }).sort({ createdAt: -1 }).lean();

        if (mDocs && mDocs.length > 0) {
          const mongoList = mDocs.map(m => ({
            id: m._id,
            user_name: m.user_name || m.userName || req.user.name,
            mobile: m.mobile || '',
            preferred_date: normalizeDateStr(m.preferred_date || m.preferredDate),
            people_count: m.people_count != null ? m.people_count : 0,
            meal_type: m.meal_type || m.mealType || 'दोपहर का भोजन',
            items_distributed: m.items_distributed || m.itemsDistributed || 'सात्विक भोजन, फल एवं मिष्ठान',
            message: m.message || '',
            status: m.status || 'लंबित',
            created_at: m.createdAt || new Date().toISOString()
          }));

          const seen = new Set(requests.map(r => `${r.mobile}_${normalizeDateStr(r.preferred_date)}_${r.meal_type}`));
          for (const mItem of mongoList) {
            const key = `${mItem.mobile}_${mItem.preferred_date}_${mItem.meal_type}`;
            if (!seen.has(key)) {
              requests.push(mItem);
              seen.add(key);
            }
          }
        }
      } catch (e) {
        console.warn('Mongo user meals fetch notice:', e.message);
      }
    }

    requests = requests.map(r => ({
      ...r,
      preferred_date: normalizeDateStr(r.preferred_date),
      people_count: r.people_count != null ? r.people_count : 0
    }));

    requests.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

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

    let requests = await db.query(sql, params).catch(() => []);
    if (!Array.isArray(requests)) requests = [];

    // Always merge with MongoDB records if connected
    if (isMongoReady()) {
      try {
        const queryFilter = {};
        if (status) queryFilter.status = status;
        if (search) {
          queryFilter.$or = [
            { user_name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { meal_type: { $regex: search, $options: 'i' } }
          ];
        }

        const mReqs = await MealRequest.find(queryFilter).sort({ createdAt: -1 }).lean();
        if (mReqs && mReqs.length > 0) {
          const mongoList = mReqs.map(m => ({
            id: m._id,
            user_name: m.user_name || m.userName || 'दानदाता',
            mobile: m.mobile || '',
            preferred_date: normalizeDateStr(m.preferred_date || m.preferredDate),
            people_count: m.people_count != null ? m.people_count : (m.peopleCount != null ? m.peopleCount : 0),
            meal_type: m.meal_type || m.mealType || 'दोपहर का भोजन',
            items_distributed: m.items_distributed || m.itemsDistributed || 'सात्विक भोजन, फल एवं मिष्ठान',
            message: m.message || '',
            status: m.status || 'लंबित',
            created_at: m.createdAt || new Date().toISOString()
          }));

          const seen = new Set(requests.map(r => `${r.mobile}_${normalizeDateStr(r.preferred_date)}_${r.meal_type}`));
          for (const mItem of mongoList) {
            const key = `${mItem.mobile}_${mItem.preferred_date}_${mItem.meal_type}`;
            if (!seen.has(key)) {
              requests.push(mItem);
              seen.add(key);
            }
          }
        }
      } catch (e) {
        console.warn('Mongo meals merge notice:', e.message);
      }
    }

    // Ensure all dates are properly normalized
    requests = requests.map(r => ({
      ...r,
      preferred_date: normalizeDateStr(r.preferred_date),
      items_distributed: r.items_distributed || 'सात्विक भोजन'
    }));

    requests.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

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

    let currentReq = await db.query(`SELECT * FROM meal_requests WHERE id = ?`, [id]).catch(() => []);
    if ((!currentReq || currentReq.length === 0) && isMongoReady()) {
      try {
        const mDoc = await MealRequest.findById(id).lean();
        if (mDoc) {
          currentReq = [{
            id: mDoc._id,
            user_name: mDoc.user_name || mDoc.userName,
            preferred_date: mDoc.preferred_date || mDoc.preferredDate,
            meal_type: mDoc.meal_type || mDoc.mealType,
            user_id: mDoc.user_id || 0,
            status: mDoc.status
          }];
        }
      } catch (e) {}
    }

    if (!currentReq || currentReq.length === 0) {
      return res.status(404).json({ success: false, message: 'भोजन अनुरोध नहीं मिला।' });
    }

    const oldStatus = currentReq[0].status;

    await db.query(
      `UPDATE meal_requests SET status = ?, admin_note = ? WHERE id = ?`,
      [status, admin_note || null, id]
    ).catch(() => {});

    // Update in MongoDB as well if connected
    if (isMongoReady()) {
      try {
        if (typeof id === 'string' && id.length === 24) {
          await MealRequest.findByIdAndUpdate(id, { $set: { status } });
        } else {
          await MealRequest.updateOne(
            { $or: [{ legacy_id: parseInt(id, 10) }, { _id: id }] },
            { $set: { status } }
          );
        }
      } catch (mErr) {
        // ignore
      }
    }

    // Save status history log
    await db.query(
      `INSERT INTO request_status_history (request_type, request_id, previous_status, new_status, changed_by, notes)
       VALUES ('meal', ?, ?, ?, ?, ?)`,
      [id, oldStatus, status, req.user ? req.user.id : 1, admin_note || '']
    ).catch(() => {});

    // Send notification to user if applicable
    const statusMsgHindi = {
      'स्वीकार किया गया': `आपका भोजन प्रायोजन अनुरोध (${currentReq[0].preferred_date} - ${currentReq[0].meal_type}) स्वीकार कर लिया गया है। साधुवाद!`,
      'अस्वीकार किया गया': `आपका भोजन प्रायोजन अनुरोध (${currentReq[0].preferred_date}) स्वीकार नहीं किया जा सका। कारण: ${admin_note || 'स्थान उपलब्ध नहीं'}`,
      'पूर्ण': `आपका भोजन प्रायोजन कार्य संपन्न हो चुका है। बुजुर्गों के आशीर्वाद हेतु धन्यवाद।`,
      'लंबित': `आपका भोजन प्रायोजन अनुरोध पुन: समीक्षाधीन (लंबित) स्थिति में है।`
    };

    const notifMsg = statusMsgHindi[status] || `आपके भोजन अनुरोध की स्थिति बदल कर '${status}' कर दी गई है।`;

    if (currentReq[0].user_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'meal')`,
        [currentReq[0].user_id, `भोजन अनुरोध स्थिति: ${status}`, notifMsg]
      ).catch(() => {});
    }

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
    await db.query('DELETE FROM meal_requests WHERE id = ?', [id]).catch(() => {});
    if (isMongoReady()) {
      try {
        if (typeof id === 'string' && id.length === 24) {
          await MealRequest.findByIdAndDelete(id);
        } else {
          await MealRequest.deleteOne({ $or: [{ legacy_id: parseInt(id, 10) }, { _id: id }] });
        }
      } catch (mErr) {
        // ignore
      }
    }
    res.json({ success: true, message: 'भोजन प्रायोजन अनुरोध रिकॉर्ड हटा दिया गया।' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Booked Slots & Slot Availability (Public)
const getBookedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    const standardSlots = [
      { id: 'सुबह का नाश्ता', name: 'सुबह का नाश्ता (Breakfast)' },
      { id: 'दोपहर का भोजन', name: 'दोपहर का भोजन (Lunch)' },
      { id: 'रात का भोजन', name: 'रात का भोजन (Dinner)' },
      { id: 'पूरे दिन का भोजन', name: 'पूरे दिन का विशेष भोजन (Full Day)' }
    ];

    let sql = `SELECT preferred_date, meal_type, status, user_name FROM meal_requests WHERE status != 'अस्वीकार किया गया'`;
    const params = [];

    if (date) {
      const targetDate = normalizeDateStr(date);
      sql += ` AND (preferred_date = ? OR DATE(preferred_date) = DATE(?))`;
      params.push(targetDate, targetDate);
    }

    const rows = await db.query(sql, params);

    const formattedRows = (rows || []).map(r => ({
      ...r,
      preferred_date: normalizeDateStr(r.preferred_date)
    }));

    if (date) {
      const targetDate = normalizeDateStr(date);
      const dayBookings = formattedRows.filter(r => r.preferred_date === targetDate);
      const bookedMealTypes = dayBookings.map(b => b.meal_type);

      const hasFullDay = bookedMealTypes.includes('पूरे दिन का भोजन');
      const allThreeIndividualBooked = ['सुबह का नाश्ता', 'दोपहर का भोजन', 'रात का भोजन'].every(s => bookedMealTypes.includes(s));

      const slots = standardSlots.map(slot => {
        let isFull = false;
        let reason = '';

        if (hasFullDay) {
          isFull = true;
          reason = 'पूरे दिन का भोजन पहले से बुक है।';
        } else if (slot.id === 'पूरे दिन का भोजन') {
          if (bookedMealTypes.length > 0) {
            isFull = true;
            reason = 'इस दिन अन्य भोजन स्लॉट बुक होने के कारण पूरा दिन उपलब्ध नहीं है।';
          }
        } else if (bookedMealTypes.includes(slot.id)) {
          isFull = true;
          reason = 'यह स्लॉट पहले से ही किसी दानदाता द्वारा बुक/फुल है।';
        }

        return {
          id: slot.id,
          name: slot.name,
          isFull,
          reason
        };
      });

      const allFull = hasFullDay || allThreeIndividualBooked || slots.every(s => s.isFull);

      return res.json({
        success: true,
        date: targetDate,
        bookedMealTypes,
        allFull,
        slots
      });
    }

    res.json({
      success: true,
      bookedSlots: formattedRows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMealRequest,
  getMyMealRequests,
  getAllMealRequests,
  updateMealStatus,
  deleteMealRequest,
  getBookedSlots
};

