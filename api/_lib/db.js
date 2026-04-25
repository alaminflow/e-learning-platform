import mongoose from 'mongoose';
import { createIndexes } from './indexes.js';

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    throw new Error('MongoDB URI not configured');
  }

  await mongoose.connect(mongoUri);
  isConnected = true;
  
  // Create indexes after connection
  await createIndexes();
}
