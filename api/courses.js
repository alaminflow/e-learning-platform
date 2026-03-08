import Course from './models/Course.js';
import User from './models/User.js';
import Enrollment from './models/Enrollment.js';
import { protect, admin } from './middleware/auth.js';
import connectDB from './lib/db.js';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().substring(0, 500);
  }
  return input;
};

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  if (path.startsWith('/api/courses')) {
    path = path.substring(12);
  } else if (path.startsWith('/api')) {
    path = path.substring(4);
  }
  return path || '/';
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed: ' + error.message });
  }
  
  const { method } = req;
  const path = getPath(req.url);
  
  const knownRoutes = ['/my-courses', '/admin/all', '/enrollments/pending'];
  const isKnownRoute = knownRoutes.some(r => path === r || path.startsWith(r + '/'));
  
  const enrollMatch = !isKnownRoute && path && path.match(/^\/([^/]+)\/enroll$/);
  const enrollmentStatusMatch = !isKnownRoute && path && path.match(/^\/([^/]+)\/enrollment-status$/);
  const courseIdMatch = !isKnownRoute && !enrollMatch && !enrollmentStatusMatch && path && path.match(/^\/([^/]+)$/);
  const studentsMatch = !isKnownRoute && path && path.match(/^\/([^/]+)\/students$/);
  const studentIdMatch = !isKnownRoute && path && path.match(/^\/([^/]+)\/students\/([^/]+)$/);

  // GET /api/courses - list published courses
  if (method === 'GET' && (path === '/' || path === '' || path === '/courses')) {
    const courses = await Course.find({ isPublished: true })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    return res.json(courses);
  }

  // POST /api/courses - create course
  if (method === 'POST' && (path === '/' || path === '' || path === '/courses')) {
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const { title, description, thumbnail, price } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const course = await Course.create({
      title,
      description,
      thumbnail: thumbnail || '',
      price: price || 0,
      createdBy: req.user._id,
      chapters: []
    });
    
    return res.status(201).json(course);
  }

  // GET /api/courses/my-courses
  if (method === 'GET' && path === '/my-courses') {
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const user = await User.findById(req.user._id);
    let courses = [];
    
    if (!user) return res.json([]);

    const enrollments = await Enrollment.find({ 
      student: req.user._id, 
      status: 'approved' 
    }).populate({
      path: 'course',
      populate: { path: 'createdBy', select: 'name' }
    });
    
    if (enrollments.length > 0) {
      courses = enrollments.map(e => e.course).filter(c => c);
    }
    
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      const legacyCourses = await Course.find({ _id: { $in: user.enrolledCourses } })
        .populate('createdBy', 'name');
      
      const existingIds = courses.map(c => c?._id?.toString()).filter(Boolean);
      legacyCourses.forEach(c => {
        if (c && !existingIds.includes(c._id.toString())) {
          courses.push(c);
        }
      });
    }
    
    return res.json(courses.filter(c => c));
  }
  
  // GET /api/courses/admin/all
  if (method === 'GET' && path === '/admin/all') {
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const courses = await Course.find()
      .populate('createdBy', 'name')
      .sort('-createdAt');
    
    const coursesWithEnrollments = courses.map(course => ({
      ...course.toObject(),
      enrolledStudents: course.enrolledStudents ? course.enrolledStudents.length : 0
    }));
    
    return res.json(coursesWithEnrollments);
  }

  // GET /api/courses/enrollments/pending
  if (method === 'GET' && path === '/enrollments/pending') {
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const enrollments = await Enrollment.find({ status: 'pending' })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-createdAt');
    return res.json(enrollments);
  }

  // GET /api/courses/:id/enrollment-status
  if (method === 'GET' && enrollmentStatusMatch) {
    const courseId = enrollmentStatusMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    
    if (!enrollment) {
      return res.json({ status: 'not_enrolled' });
    }
    
    return res.json({ status: enrollment.status });
  }

  // POST /api/courses/:id/enroll
  if (method === 'POST' && enrollMatch) {
    const courseId = enrollMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    
    if (existingEnrollment) {
      if (existingEnrollment.status === 'approved') {
        return res.status(400).json({ message: 'Already enrolled' });
      } else if (existingEnrollment.status === 'pending') {
        return res.status(400).json({ message: 'Enrollment request already pending' });
      } else if (existingEnrollment.status === 'rejected') {
        existingEnrollment.status = 'pending';
        await existingEnrollment.save();
        return res.json({ message: 'Enrollment request submitted' });
      }
    }
    
    await Enrollment.create({
      student: req.user._id,
      course: courseId,
      status: 'pending'
    });

    if (!course.enrolledStudents.includes(req.user._id)) {
      course.enrolledStudents.push(req.user._id);
      await course.save();
    }
    
    return res.json({ message: 'Enrollment request sent. Waiting for admin approval.' });
  }

  // GET /api/courses/:id/students
  if (method === 'GET' && studentsMatch) {
    const courseId = studentsMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const course = await Course.findById(courseId).populate('enrolledStudents', 'name email createdAt');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    return res.json(course.enrolledStudents || []);
  }

  // POST /api/courses/:id/students
  if (method === 'POST' && studentsMatch) {
    const courseId = studentsMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const { studentId } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    if (!student.enrolledCourses.includes(course._id)) {
      student.enrolledCourses.push(course._id);
      await student.save();
    }
    
    return res.json({ message: 'Student enrolled successfully' });
  }

  // GET/PUT/DELETE /api/courses/:id
  if (courseIdMatch) {
    const courseId = courseIdMatch[1];
    
    // GET /api/courses/:id
    if (method === 'GET') {
      const course = await Course.findById(courseId)
        .populate('createdBy', 'name');
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      return res.json(course);
    }

    // PUT /api/courses/:id
    if (method === 'PUT') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const { title, description, thumbnail, price, isPublished } = req.body;
      
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      course.title = title || course.title;
      course.description = description || course.description;
      course.thumbnail = thumbnail || course.thumbnail;
      course.price = price || course.price;
      course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;
      
      await course.save();
      return res.json(course);
    }

    // DELETE /api/courses/:id
    if (method === 'DELETE') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      await course.deleteOne();
      return res.json({ message: 'Course deleted' });
    }
  }

  // DELETE /api/courses/:id/students/:studentId
  if (method === 'DELETE' && studentIdMatch) {
    const courseId = studentIdMatch[1];
    const studentId = studentIdMatch[2];
    
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: studentId,
      status: 'approved'
    });
    
    if (enrollment) {
      enrollment.status = 'rejected';
      await enrollment.save();
    }
    
    const student = await User.findById(studentId);
    if (student) {
      student.enrolledCourses.pull(courseId);
      await student.save();
    }
    
    return res.json({ message: 'Student removed from course' });
  }

  // POST /api/courses/:id/chapters
  const chapterMatch = path && path.match(/^\/([^/]+)\/chapters$/);
  if (method === 'POST' && chapterMatch) {
    const courseId = chapterMatch[1];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const { title, order } = req.body;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.chapters.push({
      title,
      order: order || course.chapters.length,
      videos: [],
      notes: []
    });
    
    await course.save();
    return res.json(course);
  }

  // PUT /api/courses/:id/chapters/:chapterId/notes (add new note)
  const chapterNotesMatch = path && path.match(/^\/([^/]+)\/chapters\/([^/]+)\/notes$/);
  if (method === 'PUT' && chapterNotesMatch) {
    const courseId = chapterNotesMatch[1];
    const chapterId = chapterNotesMatch[2];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const { title, url } = req.body;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    if (title && url) {
      chapter.notes.push({ title, url });
    }
    
    await course.save();
    return res.json(course);
  }

  // DELETE /api/courses/:id/chapters/:chapterId/notes/:noteId
  const chapterNoteDeleteMatch = path && path.match(/^\/([^/]+)\/chapters\/([^/]+)\/notes\/([^/]+)$/);
  if (method === 'DELETE' && chapterNoteDeleteMatch) {
    const courseId = chapterNoteDeleteMatch[1];
    const chapterId = chapterNoteDeleteMatch[2];
    const noteId = chapterNoteDeleteMatch[3];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    chapter.notes = chapter.notes.filter(n => n._id.toString() !== noteId);
    
    await course.save();
    return res.json(course);
  }

  // POST /api/courses/:id/chapters/:chapterId/videos
  const chapterVideoMatch = path && path.match(/^\/([^/]+)\/chapters\/([^/]+)\/videos$/);
  if (method === 'POST' && chapterVideoMatch) {
    const courseId = chapterVideoMatch[1];
    const chapterId = chapterVideoMatch[2];
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const { title, youtubeUrl, duration } = req.body;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const chapter = course.chapters.id(chapterId);
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    chapter.videos.push({
      title,
      youtubeUrl,
      youtubeId,
      duration: duration || 0,
      order: chapter.videos.length
    });
    
    await course.save();
    return res.json(course);
  }

  // PUT/DELETE /api/courses/:id/chapters/:chapterId
  const chapterIdMatch = path && path.match(/^\/([^/]+)\/chapters\/([^/]+)$/);
  if (chapterIdMatch) {
    const courseId = chapterIdMatch[1];
    const chapterId = chapterIdMatch[2];
    
    if (method === 'PUT') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const { title, order } = req.body;
      
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const chapter = course.chapters.id(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      chapter.title = title || chapter.title;
      chapter.order = order !== undefined ? order : chapter.order;
      
      await course.save();
      return res.json(course);
    }

    if (method === 'DELETE') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      course.chapters.pull(chapterId);
      await course.save();
      return res.json(course);
    }
  }

  // PUT/DELETE /api/courses/:id/chapters/:chapterId/videos/:videoId
  const videoIdMatch = path && path.match(/^\/([^/]+)\/chapters\/([^/]+)\/videos\/([^/]+)$/);
  if (videoIdMatch && (method === 'PUT' || method === 'DELETE')) {
    const vidCourseId = videoIdMatch[1];
    const vidChapterId = videoIdMatch[2];
    const videoId = videoIdMatch[3];
    
    if (method === 'PUT') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const { title, youtubeUrl, duration, order } = req.body;
      
      const course = await Course.findById(vidCourseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const chapter = course.chapters.id(vidChapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      const video = chapter.videos.id(videoId);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      video.title = title || video.title;
      if (youtubeUrl) {
        const youtubeId = extractYouTubeId(youtubeUrl);
        if (youtubeId) {
          video.youtubeUrl = youtubeUrl;
          video.youtubeId = youtubeId;
        }
      }
      video.duration = duration !== undefined ? duration : video.duration;
      video.order = order !== undefined ? order : video.order;
      
      await course.save();
      return res.json(course);
    }

    if (method === 'DELETE') {
      const authError = await protect(req, res);
      if (authError) return authError;
      
      const adminError = admin(req, res);
      if (adminError) return adminError;
      
      const course = await Course.findById(vidCourseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const chapter = course.chapters.id(vidChapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      chapter.videos.pull(videoId);
      await course.save();
      return res.json(course);
    }
  }

  // POST /api/courses/:id/enrollments/:enrollmentId/approve|reject
  const enrollmentActionMatch = path && path.match(/^\/([^/]+)\/enrollments\/([^/]+)\/(approve|reject)$/);
  if (method === 'POST' && enrollmentActionMatch) {
    const courseId = enrollmentActionMatch[1];
    const enrollmentId = enrollmentActionMatch[2];
    const action = enrollmentActionMatch[3];
    
    const authError = await protect(req, res);
    if (authError) return authError;
    
    const adminError = admin(req, res);
    if (adminError) return adminError;
    
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }
    
    if (enrollment.course.toString() !== courseId) {
      return res.status(400).json({ message: 'Course mismatch' });
    }
    
    enrollment.status = action === 'approve' ? 'approved' : 'rejected';
    await enrollment.save();
    
    if (action === 'approve') {
      const student = await User.findById(enrollment.student);
      if (student && !student.enrolledCourses.includes(enrollment.course)) {
        student.enrolledCourses.push(enrollment.course);
        await student.save();
      }

      const course = await Course.findById(enrollment.course);
      if (course && !course.enrolledStudents.includes(enrollment.student)) {
        course.enrolledStudents.push(enrollment.student);
        await course.save();
      }
    }
    
    return res.json({ message: `Enrollment ${action}d` });
  }

  return res.status(404).json({ message: 'Endpoint not found: ' + path });
}
