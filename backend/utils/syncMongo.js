const db = require('../db/initDb');
const MealRequest = require('../models/MealRequest');
const AssistanceRequest = require('../models/AssistanceRequest');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const ContactSubmission = require('../models/ContactSubmission');
const Need = require('../models/Need');
const { getMongoStatus } = require('../db/mongoConnect');

const syncSqliteToMongo = async () => {
  const status = getMongoStatus();
  if (!status.isConnected) {
    console.log('ℹ️ [MongoDB Sync] MongoDB is not connected. Skipping sync.');
    return { success: false, message: 'MongoDB not connected' };
  }

  console.log('🔄 [MongoDB Sync] Starting data sync from SQL to MongoDB...');
  const stats = { meals: 0, assistance: 0, volunteers: 0, contacts: 0, needs: 0 };

  try {
    // 1. Sync Meals
    const meals = await db.query('SELECT * FROM meal_requests');
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
    const assists = await db.query('SELECT * FROM assistance_requests');
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
    const vols = await db.query('SELECT * FROM volunteer_registrations');
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
    const contacts = await db.query('SELECT * FROM contact_submissions');
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
    const needs = await db.query('SELECT * FROM needs');
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

    console.log(`✅ [MongoDB Sync] Complete! Synced: ${JSON.stringify(stats)}`);
    return { success: true, stats };
  } catch (err) {
    console.error('❌ [MongoDB Sync Error]:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { syncSqliteToMongo };
