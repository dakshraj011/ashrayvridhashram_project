const mongoose = require('mongoose');

let isConnected = false;

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('ℹ️ [MongoDB] MONGODB_URI is not configured in .env yet.');
    console.log('👉 Please provide your MongoDB connection string (e.g., mongodb+srv://... in backend/.env).');
    return false;
  }

  try {
    console.log('🍃 [MongoDB] Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`🍃 [MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    
    // Auto-sync existing data to MongoDB
    setTimeout(() => {
      const { syncSqliteToMongo } = require('../utils/syncMongo');
      syncSqliteToMongo().catch(e => console.warn('Sync error:', e.message));
    }, 1000);

    return true;
  } catch (error) {
    console.error('❌ [MongoDB] Connection error:', error.message);
    isConnected = false;
    return false;
  }
};

const getMongoStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || null,
    host: mongoose.connection.host || null
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
