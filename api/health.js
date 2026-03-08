import connectDB from './lib/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
