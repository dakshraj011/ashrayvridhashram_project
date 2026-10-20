const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class JsonStore {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, 'aashray_store.json');
    this.data = {
      users: [],
      home_information: [],
      needs: [],
      meal_requests: [],
      volunteer_registrations: [],
      assistance_requests: [],
      events: [],
      gallery_images: [],
      contact_submissions: [],
      notifications: [],
      request_status_history: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        if (Array.isArray(this.data.users)) {
          this.data.users = this.data.users.filter(u => u.role !== 'manager');
        }
      }
    } catch (err) {
      console.warn('⚠️ [JsonStore] Error reading file, using in-memory state:', err.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('⚠️ [JsonStore] Error saving file:', err.message);
    }
  }

  async seedIfEmpty() {
    let modified = false;

    // 1. Ensure admin user only
    if (!this.data.users || this.data.users.length === 0) {
      const adminHash = await bcrypt.hash('hare krishna', 10);
      this.data.users = [
        {
          id: 1,
          name: 'मुख्य प्रशासक (Admin)',
          email: 'admin@aashray.org',
          mobile: '6306638958',
          password: adminHash,
          role: 'admin',
          address: 'आश्रम पता, उरई, जिला जालौन (उत्तर प्रदेश)',
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 2. Ensure home_information
    if (!this.data.home_information || this.data.home_information.length === 0) {
      this.data.home_information = [
        {
          id: 1,
          name: 'आश्रय वृद्धाश्रम',
          tagline: 'वरिष्ठ नागरिकों का अपना स्नेहपूर्ण एवं सुरक्षित धाम',
          description: 'आश्रय वृद्धाश्रम उरई (जालौन) में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है। यहाँ बुजुर्गों को सात्विक भोजन, नियमित स्वास्थ्य देखभाल, योगाभ्यास, भक्ति भजन और आत्मीय परिवार जैसा वातावरण प्रदान किया जाता है।',
          address: 'आश्रम पता, उरई, जिला जालौन (उत्तर प्रदेश)',
          phone: '7860437507',
          email: 'dakshrajs104@gmail.com',
          facilities: JSON.stringify([
            "24x7 स्वास्थ्य देखभाल एवं डॉक्टर परामर्श",
            "सात्विक एवं पौष्टिक भोजन",
            "हवादार एवं आरामदायक कमरे",
            "दैनिक योग, ध्यान एवं श्री कृष्ण संकीर्तन",
            "पुस्तकालय एवं मनोरंजन कक्ष",
            "धार्मिक एवं सांस्कृतिक यात्राएँ"
          ]),
          hero_image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
          about_images: JSON.stringify([
            "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
          ]),
          updated_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 3. Ensure needs
    if (!this.data.needs || this.data.needs.length === 0) {
      this.data.needs = [
        {
          id: 1,
          title: 'सर्दियों के लिए गर्म कंबल एवं चादरें',
          category: 'कपड़े',
          description: 'आश्रम के 45 बुजुर्ग निवासियों के लिए सर्दियों हेतु ऊनी कंबल और कॉटन चादरों की आवश्यकता है।',
          required_quantity: 50,
          available_quantity: 15,
          unit: 'नग',
          photo_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
          status: 'सक्रिय',
          created_by: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'दैनिक मधुमेह एवं बीपी की दवाइयाँ',
          category: 'दवाइयाँ',
          description: 'बुजुर्गों के नियमित स्वास्थ्य परीक्षण और मासिक दवाओं के लिए सहायता।',
          required_quantity: 100,
          available_quantity: 40,
          unit: 'पैकेट',
          photo_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          status: 'सक्रिय',
          created_by: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'कमरों के लिए खड़े पंखे (Stand Fans)',
          category: 'पंखे',
          description: 'गर्मी के मौसम में बुजुर्गों के विश्राम कक्षों के लिए वाटर कूलिंग स्टैंड फैन्स।',
          required_quantity: 10,
          available_quantity: 4,
          unit: 'नग',
          photo_url: 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?auto=format&fit=crop&w=600&q=80',
          status: 'सक्रिय',
          created_by: 2,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          title: 'सात्विक भोजन सामग्री (आटा, चावल, दाल)',
          category: 'भोजन',
          description: 'मासिक रसोई हेतु शुद्ध देसी घी, बासमती चावल, अरहर दाल और गेहूं के आटे की रसद।',
          required_quantity: 200,
          available_quantity: 120,
          unit: 'किलो',
          photo_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=600&q=80',
          status: 'सक्रिय',
          created_by: 1,
          created_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 4. Ensure events
    if (!this.data.events || this.data.events.length === 0) {
      this.data.events = [
        {
          id: 1,
          title: 'श्री कृष्ण जन्माष्टमी उत्सव एवं महाप्रसाद',
          event_date: '2026-08-25',
          description: 'आश्रय परिसर में बाबाओं और माताओं द्वारा कृष्ण भजन संध्या, झांकी एवं 56 भोग महाप्रसाद वितरण समारोह।',
          image_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
          is_published: 1,
          created_by: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'निःशुल्क नेत्र जांच एवं स्वास्थ्य शिविर',
          event_date: '2026-09-15',
          description: 'प्रसिद्ध नेत्र विशेषज्ञों द्वारा आश्रम के सभी बुजुर्गों की आँखों की जांच और निःशुल्क चश्मों का वितरण।',
          image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
          is_published: 1,
          created_by: 1,
          created_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 5. Ensure sample meal requests
    if (!this.data.meal_requests || this.data.meal_requests.length === 0) {
      this.data.meal_requests = [
        {
          id: 1,
          user_id: 3,
          user_name: 'अमित कुमार (दानदाता)',
          mobile: '9876543212',
          preferred_date: '2026-10-15',
          people_count: 50,
          meal_type: 'दोपहर का भोजन',
          items_distributed: 'सात्विक भोजन, खीर एवं फल',
          message: 'पिताजी के जन्मदिन पर सभी बुजुर्गों को विशेष भोजन।',
          status: 'लंबित',
          admin_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 6. Ensure sample volunteer registrations
    if (!this.data.volunteer_registrations || this.data.volunteer_registrations.length === 0) {
      this.data.volunteer_registrations = [
        {
          id: 1,
          user_id: 3,
          full_name: 'अमित कुमार',
          mobile: '9876543212',
          email: 'amit@gmail.com',
          address: 'उरई (जालौन)',
          preferred_date: '2026-10-15',
          help_type: 'भोजन वितरण',
          message: 'रविवार को भोजन परोसने और सेवा करने का अवसर चाहिए।',
          status: 'स्वीकार किया गया',
          admin_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 7. Ensure sample assistance requests
    if (!this.data.assistance_requests || this.data.assistance_requests.length === 0) {
      this.data.assistance_requests = [
        {
          id: 1,
          user_id: 3,
          elderly_name: 'रामलाल जी (उम्र 72)',
          elderly_age: 72,
          contact_number: '9876500000',
          address: 'स्टेशन रोड, उरई',
          assistance_type: 'दवाइयाँ',
          description: 'बुजुर्ग को नियमित बीपी एवं शुगर की दवाओं की तत्काल आवश्यकता है।',
          photo_url: null,
          assigned_manager_id: null,
          status: 'लंबित',
          admin_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    // 8. Ensure sample contact submissions
    if (!this.data.contact_submissions || this.data.contact_submissions.length === 0) {
      this.data.contact_submissions = [
        {
          id: 1,
          name: 'विकास शर्मा',
          mobile: '9123456789',
          email: 'vikas@gmail.com',
          subject: 'आश्रम भ्रमण एवं सहयोग',
          message: 'हम सपरिवार आकर आश्रम में बुजुर्गों से मिलना चाहते हैं।',
          status: 'अपठित',
          created_at: new Date().toISOString()
        }
      ];
      modified = true;
    }

    if (modified) {
      this.save();
      console.log('✅ [JsonStore] Initial seed data created & saved!');
    }
  }

  async query(sql, params = []) {
    const rawSql = (sql || '').trim();
    const upper = rawSql.toUpperCase();

    // 1. ALTER TABLE -> ignore
    if (upper.startsWith('ALTER TABLE')) {
      return { affectedRows: 0 };
    }

    // 2. INSERT INTO <table> (<cols>) VALUES (?, ?, ...)
    if (upper.startsWith('INSERT INTO')) {
      const match = rawSql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const table = match[1].toLowerCase();
        const cols = match[2].split(',').map(c => c.trim().replace(/[`"']/g, ''));
        const valTokens = match[3].split(',').map(v => v.trim());
        if (!this.data[table]) this.data[table] = [];

        const newRecord = {};
        const existingIds = this.data[table].map(r => Number(r.id) || 0);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        let idVal = maxId + 1;

        let pIdx = 0;
        cols.forEach((col, idx) => {
          const token = valTokens[idx] || '?';
          if (token === '?') {
            newRecord[col] = params[pIdx] !== undefined ? params[pIdx] : null;
            pIdx++;
          } else {
            // Literal value like 'लंबित', 'अपठित', 'user', 1, 0, NULL
            let lit = token.replace(/^['"]|['"]$/g, '');
            if (lit.toUpperCase() === 'NULL') lit = null;
            else if (!isNaN(lit) && token.indexOf("'") === -1 && token.indexOf('"') === -1) lit = Number(lit);
            newRecord[col] = lit;
          }
        });

        // Ensure default status
        if (!newRecord.status) {
          if (table === 'contact_submissions') newRecord.status = 'अपठित';
          else if (table === 'needs') newRecord.status = 'सक्रिय';
          else newRecord.status = 'लंबित';
        }

        if (newRecord.id) {
          idVal = Number(newRecord.id);
        } else {
          newRecord.id = idVal;
        }

        if (!newRecord.created_at) newRecord.created_at = new Date().toISOString();
        if (!newRecord.updated_at) newRecord.updated_at = new Date().toISOString();

        this.data[table].unshift(newRecord);
        this.save();
        return { insertId: idVal, affectedRows: 1 };
      }
    }

    // 3. SELECT COUNT(*) as cnt FROM <table> [WHERE ...]
    if (upper.includes('COUNT(*)')) {
      const match = rawSql.match(/FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*))?/i);
      if (match) {
        const table = match[1].toLowerCase();
        const whereClause = match[2] || '';
        const rows = this.data[table] || [];

        let filtered = rows;
        if (whereClause) {
          if (whereClause.includes("status = 'लंबित'")) {
            filtered = rows.filter(r => (r.status === 'लंबित' || !r.status));
          } else if (whereClause.includes("status = 'सक्रिय'")) {
            filtered = rows.filter(r => r.status === 'सक्रिय');
          } else if (whereClause.includes("role = 'user'")) {
            filtered = rows.filter(r => r.role === 'user');
          } else if (whereClause.includes("role = 'manager'")) {
            filtered = rows.filter(r => r.role === 'manager');
          }
        }
        return [{ cnt: filtered.length }];
      }
      return [{ cnt: 0 }];
    }

    // 4. SELECT ... FROM <table>
    if (upper.startsWith('SELECT')) {
      const fromMatch = rawSql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (!fromMatch) return [];

      const tableName = fromMatch[1].toLowerCase();
      if (!this.data[tableName]) return [];

      let rows = [...(this.data[tableName] || [])];

      // Handle simple WHERE conditions
      if (rawSql.includes('WHERE')) {
        if (rawSql.includes('preferred_date = ?') || rawSql.includes('DATE(preferred_date)')) {
          const targetDate = String(params[0] || '').split('T')[0];
          if (targetDate) {
            rows = rows.filter(r => String(r.preferred_date).split('T')[0] === targetDate);
          }
          if (rawSql.includes("status != 'अस्वीकार किया गया'")) {
            rows = rows.filter(r => r.status !== 'अस्वीकार किया गया');
          }
        } else if (rawSql.includes('WHERE id = ?') || rawSql.includes('WHERE id = 1')) {
          const targetId = params.length > 0 ? Number(params[0]) : 1;
          rows = rows.filter(r => Number(r.id) === targetId);
        } else if (rawSql.includes('WHERE mobile = ? OR role = ?')) {
          const [mob, role] = params;
          rows = rows.filter(r => String(r.mobile) === String(mob) || r.role === role);
        } else if (rawSql.includes('WHERE mobile = ?')) {
          rows = rows.filter(r => String(r.mobile) === String(params[0]));
        } else if (rawSql.includes('WHERE user_id = ?')) {
          const uid = Number(params[0]);
          rows = rows.filter(r => Number(r.user_id) === uid);
        } else if (rawSql.includes("WHERE status != 'अस्वीकार किया गया'")) {
          rows = rows.filter(r => r.status !== 'अस्वीकार किया गया');
          if (params.length > 0 && params[0]) {
            const dateStr = String(params[0]).split('T')[0];
            rows = rows.filter(r => String(r.preferred_date).split('T')[0] === dateStr);
          }
        } else if (rawSql.includes('WHERE 1=1')) {
          let pIdx = 0;
          if (rawSql.includes('AND status = ?') || rawSql.includes('AND m.status = ?') || rawSql.includes('AND a.status = ?')) {
            const st = params[pIdx++];
            if (st) rows = rows.filter(r => r.status === st);
          }
          if (rawSql.includes('AND a.assistance_type = ?')) {
            const at = params[pIdx++];
            if (at) rows = rows.filter(r => r.assistance_type === at);
          }
          if (rawSql.includes('AND role = ?')) {
            const role = params[pIdx++];
            if (role) rows = rows.filter(r => r.role === role);
          }
          if (rawSql.includes('LIKE ?')) {
            const searchVal = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
            if (searchVal) {
              rows = rows.filter(r => {
                const combined = Object.values(r).join(' ').toLowerCase();
                return combined.includes(searchVal);
              });
            }
          }
        }
      }

      // Joins for user email / manager name
      if (tableName === 'meal_requests' && this.data.users) {
        rows = rows.map(r => {
          const u = this.data.users.find(usr => Number(usr.id) === Number(r.user_id));
          return { ...r, email: u ? u.email : null };
        });
      }

      if (tableName === 'assistance_requests' && this.data.users) {
        rows = rows.map(r => {
          const u = this.data.users.find(usr => Number(usr.id) === Number(r.user_id));
          const mgr = this.data.users.find(usr => Number(usr.id) === Number(r.assigned_manager_id));
          return {
            ...r,
            submitter_name: u ? u.name : null,
            submitter_mobile: u ? u.mobile : null,
            manager_name: mgr ? mgr.name : null
          };
        });
      }

      // Sort by created_at DESC
      rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      return rows;
    }

    // 5. UPDATE <table> SET ... WHERE id = ?
    if (upper.startsWith('UPDATE')) {
      const match = rawSql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.*?)\s+WHERE\s+id\s*=\s*(?:\?|(\d+))/i);
      if (match) {
        const table = match[1].toLowerCase();
        const setPart = match[2];
        const rows = this.data[table] || [];

        const idParam = match[3] ? Number(match[3]) : Number(params[params.length - 1]);
        const targetRow = rows.find(r => Number(r.id) === idParam);

        if (targetRow) {
          const assignments = setPart.split(',').map(s => s.trim());
          assignments.forEach((assignment, idx) => {
            const colName = assignment.split('=')[0].trim().replace(/[`"']/g, '');
            targetRow[colName] = params[idx];
          });
          targetRow.updated_at = new Date().toISOString();
          this.save();
          return { affectedRows: 1 };
        }
      }
      return { affectedRows: 0 };
    }

    // 6. DELETE FROM <table> WHERE id = ?
    if (upper.startsWith('DELETE')) {
      const match = rawSql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+id\s*=\s*\?/i);
      if (match) {
        const table = match[1].toLowerCase();
        const idToDelete = Number(params[0]);
        if (this.data[table]) {
          const initialLen = this.data[table].length;
          this.data[table] = this.data[table].filter(r => Number(r.id) !== idToDelete);
          this.save();
          return { affectedRows: initialLen - this.data[table].length };
        }
      }
      return { affectedRows: 0 };
    }

    return [];
  }
}

module.exports = JsonStore;
