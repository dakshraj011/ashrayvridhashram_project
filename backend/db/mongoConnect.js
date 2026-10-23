const mongoose = require('mongoose');

let isConnected = false;
let lastError = null;

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL;

  if (!mongoUri || !mongoUri.trim()) {
    lastError = 'MONGODB_URI is not configured in .env yet';
    console.log('ℹ️ [MongoDB] MONGODB_URI is not configured in .env yet.');
    console.log('👉 Please provide your MongoDB connection string (e.g., mongodb+srv://... in backend/.env).');
    return false;
  }

  try {
    console.log('🍃 [MongoDB] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri.trim(), {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    lastError = null;
    console.log(`🍃 [MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    
    // Auto-sync existing data to MongoDB
    setTimeout(() => {
      const { syncSqliteToMongo } = require('../utils/syncMongo');
      syncSqliteToMongo().catch(e => console.warn('Sync error:', e.message));
    }, 1200);

    return true;
  } catch (error) {
    lastError = error.message;
    console.error('❌ [MongoDB] Connection error:', error.message);
    isConnected = false;
    return false;
  }
};

const getMongoStatus = () => {
  const configured = Boolean((process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL || '').trim());
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
    isConfigured: configured,
    lastError: lastError
  };
};

// Prevent buffering delays when disconnected
mongoose.set('bufferCommands', false);

const isMongoReady = () => mongoose.connection.readyState === 1;

module.exports = {
  connectMongoDB,
  getMongoStatus,
  isMongoReady,
  mongoose
};
