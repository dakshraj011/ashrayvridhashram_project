const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db/initDb');

const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const needRoutes = require('./routes/needRoutes');
const mealRoutes = require('./routes/mealRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const assistanceRoutes = require('./routes/assistanceRoutes');
const eventRoutes = require('./routes/eventRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/assistance', assistanceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Aashray Old Age Home API',
    dbDriver: db.driver,
    time: new Date().toISOString()
  });
});

// Serve Frontend static assets if available (Production / Render Full-Stack build)
const possibleDistPaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, 'frontend/dist'),
  path.join(process.cwd(), 'frontend/dist')
];
const frontendDist = possibleDistPaths.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`📦 [PROD] Frontend production build detected at: ${frontendDist}`);
  app.use(express.static(frontendDist));
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'एपीआई मार्ग नहीं मिला (API Route Not Found)' });
});

// Fallback: For any other unhandled GET route, serve SPA index.html if dist exists
app.use((req, res) => {
  if (frontendDist && req.method === 'GET') {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.status(404).json({ success: false, message: 'एपीआई मार्ग नहीं मिला (API Route Not Found)' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'आंतरिक सर्वर त्रुटि (Internal Server Error)'
  });
});

// Initialize DB and start server
db.init().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🛕 आश्रय (AASHRAY) सर्वर चालू है! (PORT: ${PORT})`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    if (frontendDist) {
      console.log(`🌐 Web App:  http://localhost:${PORT}`);
    }
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Fatal DB Init Error:', err);
});
