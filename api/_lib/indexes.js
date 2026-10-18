import Enrollment from '../_models/Enrollment.js';
import Attendance from '../_models/Attendance.js';
import Result from '../_models/Result.js';
import Payment from '../_models/Payment.js';
import Course from '../_models/Course.js';
import User from '../_models/User.js';

let indexesCreated = false;

export async function createIndexes() {
  if (indexesCreated) {
    return;
  }

  try {
    const indexPromises = [
      // Enrollment indexes
      Enrollment.createIndex({ student: 1, status: 1 }),
      Enrollment.createIndex({ course: 1, status: 1 }),
      Enrollment.createIndex({ student: 1, course: 1 }, { unique: true }),
      Enrollment.createIndex({ student: 1, course: 1, status: 1 }),
      Enrollment.createIndex({ status: 1, createdAt: -1 }),
      Enrollment.createIndex({ createdAt: -1 }),

      // Attendance indexes
      Attendance.createIndex({ course: 1, date: 1 }),
      Attendance.createIndex({ student: 1, date: 1 }),
      Attendance.createIndex({ course: 1, student: 1, date: 1 }, { unique: true }),

      // Result indexes
      Result.createIndex({ student: 1, course: 1 }),
      Result.createIndex({ course: 1, createdAt: -1 }),
      Result.createIndex({ student: 1, examTitle: 1 }, { unique: true }),

      // Payment indexes
      Payment.createIndex({ student: 1, month: 1, year: 1 }),
      Payment.createIndex({ student: 1, status: 1 }),
      Payment.createIndex({ month: 1, year: 1 }),

      // Course indexes
      Course.createIndex({ isPublished: 1, createdAt: -1 }),
      Course.createIndex({ isPublished: 1, category: 1, createdAt: -1 }),
      Course.createIndex({ category: 1, createdAt: -1 }),
      Course.createIndex({ createdBy: 1 }),

      // User indexes
      User.createIndex({ role: 1 }),
      User.createIndex({ isVerified: 1 }),
      User.createIndex({ createdAt: -1 }),
      User.createIndex({ role: 1, createdAt: -1 })
    ];

    await Promise.allSettled(indexPromises);
    indexesCreated = true;
  } catch (error) {
    // Non-blocking error handling
    indexesCreated = true;
  }
}