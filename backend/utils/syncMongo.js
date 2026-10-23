const db = require('../db/initDb');
const MealRequest = require('../models/MealRequest');
const AssistanceRequest = require('../models/AssistanceRequest');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const ContactSubmission = require('../models/ContactSubmission');
const Need = require('../models/Need');
const Event = require('../models/Event');
const GalleryImage = require('../models/GalleryImage');
const { getMongoStatus } = require('../db/mongoConnect');

const syncSqliteToMongo = async () => {
  const status = getMongoStatus();
  if (!status.isConnected) {
    console.log('ℹ️ [MongoDB Sync] MongoDB is not connected. Skipping sync.');
    return { success: false, message: 'MongoDB not connected' };
  }

  console.log('🔄 [MongoDB Sync] Starting data sync from SQL to MongoDB...');
  const stats = { meals: 0, assistance: 0, volunteers: 0, contacts: 0, needs: 0, events: 0, gallery: 0 };

  try {
    // 1. Sync Meals
    const meals = await db.query('SELECT * FROM meal_requests').catch(() => []);
    for (const m of meals) {
      const exists = await MealRequest.findOne({ legacy_id: m.id });
      if (!exists) {
        await MealRequest.create({
          user_name: m.user_name,
          mobile: m.mobile,
          preferred_date: (m.preferred_date || '').toString().split('T')[0],
          meal_type: m.meal_type,
          people_count: m.people_count != null ? m.people_count : 0,
          items_distributed: m.items_distributed || 'सात्विक भोजन, फल एवं मिष्ठान',
          message: m.message || '',
          status: m.status || 'लंबित',
          user_id: m.user_id || 0,
          legacy_id: m.id,
          createdAt: m.created_at || new Date()
        });
        stats.meals++;
      }
    }

    // 2. Sync Assistance (Medicine/Shelter)
    const assists = await db.query('SELECT * FROM assistance_requests').catch(() => []);
    for (const a of assists) {
      const exists = await AssistanceRequest.findOne({ legacy_id: a.id });
      if (!exists) {
        await AssistanceRequest.create({
          elderly_name: a.elderly_name,
          elderly_age: a.elderly_age,
          contact_number: a.contact_number,
          address: a.address,
          assistance_type: a.assistance_type,
          description: a.description,
          photo_url: a.photo_url || null,
          status: a.status || 'लंबित',
          user_id: a.user_id || 0,
          legacy_id: a.id,
          createdAt: a.created_at || new Date()
        });
        stats.assistance++;
      }
    }

    // 3. Sync Volunteers
    const vols = await db.query('SELECT * FROM volunteer_registrations').catch(() => []);
    for (const v of vols) {
      const exists = await VolunteerRegistration.findOne({ legacy_id: v.id });
      if (!exists) {
        await VolunteerRegistration.create({
          full_name: v.full_name,
          mobile: v.mobile,
          email: v.email || null,
          address: v.address || '',
          preferred_date: (v.preferred_date || '').toString().split('T')[0],
          help_type: v.help_type,
          message: v.message || '',
          status: v.status || 'लंबित',
          user_id: v.user_id || 0,
          legacy_id: v.id,
          createdAt: v.created_at || new Date()
        });
        stats.volunteers++;
      }
    }

    // 4. Sync Contact Submissions
    const contacts = await db.query('SELECT * FROM contact_submissions').catch(() => []);
    for (const c of contacts) {
      const exists = await ContactSubmission.findOne({ legacy_id: c.id });
      if (!exists) {
        await ContactSubmission.create({
          name: c.name,
          mobile: c.mobile,
          email: c.email || null,
          subject: c.subject || 'सामान्य पूछताछ',
          message: c.message,
          status: c.status || 'अपठित',
          legacy_id: c.id,
          createdAt: c.created_at || new Date()
        });
        stats.contacts++;
      }
    }

    // 5. Sync Needs
    const needs = await db.query('SELECT * FROM needs').catch(() => []);
    for (const n of needs) {
      const exists = await Need.findOne({ legacy_id: n.id });
      if (!exists) {
        await Need.create({
          title: n.title,
          category: n.category,
          description: n.description || '',
          required_quantity: n.required_quantity,
          available_quantity: n.available_quantity || 0,
          unit: n.unit || 'इकाई',
          photo_url: n.photo_url || null,
          status: n.status || 'सक्रिय',
          created_by: n.created_by || 1,
          legacy_id: n.id,
          createdAt: n.created_at || new Date()
        });
        stats.needs++;
      }
    }

    // 6. Sync Events
    const events = await db.query('SELECT * FROM events').catch(() => []);
    for (const e of events) {
      const exists = await Event.findOne({
        $or: [{ legacy_id: e.id }, { title: e.title, event_date: (e.event_date || '').toString().split('T')[0] }]
      });
      if (!exists) {
        await Event.create({
          title: e.title,
          event_date: (e.event_date || '').toString().split('T')[0],
          description: e.description || '',
          image_url: e.image_url || null,
          photos: e.image_url ? [e.image_url] : [],
          is_published: e.is_published !== undefined ? e.is_published : 1,
          created_by: e.created_by || 1,
          legacy_id: e.id,
          createdAt: e.created_at || new Date()
        });
        stats.events++;
      }
    }

    // 7. Sync Gallery Images
    const gallery = await db.query('SELECT * FROM gallery_images').catch(() => []);
    for (const g of gallery) {
      const exists = await GalleryImage.findOne({
        $or: [{ legacy_id: g.id }, { image_url: g.image_url }]
      });
      if (!exists) {
        await GalleryImage.create({
          event_id: g.event_id || null,
          title: g.title || 'आश्रम गैलरी',
          image_url: g.image_url,
          category: g.category || 'कार्यक्रम',
          legacy_id: g.id,
          createdAt: g.created_at || new Date()
        });
        stats.gallery++;
      }
    }

    console.log(`✅ [MongoDB Sync] Complete! Synced: ${JSON.stringify(stats)}`);
    return { success: true, stats };
  } catch (err) {
    console.error('❌ [MongoDB Sync Error]:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { syncSqliteToMongo };
