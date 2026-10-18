import mongoose from 'mongoose';
import { createIndexes } from './indexes.js';

// Use globalThis so the connection survives across Vercel serverless hot-reloads.
const cached = globalThis._mongooseCache || (globalThis._mongooseCache = { conn: null, promise: null });

export default async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }

    cached.promise = mongoose
      .connect(mongoUri, {
        maxPoolSize: 3,               // Safe for MongoDB Atlas M0 free tier (100 connection limit)
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,        // Fail fast instead of queuing indefinitely
      })
      .then((m) => {
        // Run index creation asynchronously in background without blocking initial request
        createIndexes().catch(() => {});
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
