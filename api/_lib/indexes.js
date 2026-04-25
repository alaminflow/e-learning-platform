import Enrollment from '../_models/Enrollment.js';
import Attendance from '../_models/Attendance.js';
import Result from '../_models/Result.js';
import Payment from '../_models/Payment.js';
import Course from '../_models/Course.js';

let indexesCreated = false;

export async function createIndexes() {
  if (indexesCreated) {
    return;
  }

  console.log('🔧 Creating MongoDB indexes...');

  try {
    // Enrollment indexes
    await Enrollment.createIndex({ student: 1, status: 1 });
    await Enrollment.createIndex({ course: 1, status: 1 });
    await Enrollment.createIndex({ student: 1, course: 1 }, { unique: true });
    await Enrollment.createIndex({ createdAt: -1 });

    // Attendance indexes
    await Attendance.createIndex({ course: 1, date: 1 });
    await Attendance.createIndex({ student: 1, date: 1 });
    await Attendance.createIndex({ course: 1, student: 1, date: 1 }, { unique: true });

    // Result indexes
    await Result.createIndex({ student: 1, course: 1 });
    await Result.createIndex({ course: 1, createdAt: -1 });
    await Result.createIndex({ student: 1, examTitle: 1 }, { unique: true });

    // Payment indexes
    await Payment.createIndex({ student: 1, month: 1, year: 1 });
    await Payment.createIndex({ student: 1, status: 1 });

    // Course indexes (if not exists)
    await Course.createIndex({ isPublished: 1, createdAt: -1 });
    await Course.createIndex({ category: 1, createdAt: -1 });
    await Course.createIndex({ createdBy: 1 });

    indexesCreated = true;
    console.log('✅ MongoDB indexes created successfully');
  } catch (error) {
    // Ignore index AlreadyExists errors
    if (error.code !== 85 && error.code !== 86) {
      console.error('❌ Index creation error:', error.message);
    } else {
      console.log('✅ MongoDB indexes already exist');
      indexesCreated = true;
    }
  }
}