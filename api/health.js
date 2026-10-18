import connectDB from './_lib/db.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await connectDB();
    const isConnected = mongoose.connection.readyState === 1;

    return res.json({
      status: isConnected ? 'ok' : 'connecting',
      message: isConnected ? 'Connected to MongoDB' : 'MongoDB connecting',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    let errorMessage = error.message;

    if (error.message.includes('authentication failed')) {
      errorMessage = 'bad auth: authentication failed - check your MONGODB_URI username/password';
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      errorMessage = 'Connection timeout - check your MONGODB_URI database host';
    } else if (error.message.includes('MongoDB URI not configured')) {
      errorMessage = 'MONGODB_URI environment variable is not set';
    }

    return res.status(500).json({ status: 'error', message: errorMessage });
  }
}
