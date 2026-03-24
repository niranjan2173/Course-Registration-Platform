const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, getDb, mapUser, mapCourse, mapRegistration } = require('./db');
const { requireAuth, requireAdmin } = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    {
      id: String(user.id),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, password, department, phone, address, location, studyLevel, institution, dob } = req.body;

    if (!name || !email || !password || !department || !phone || !address || !location || !studyLevel || !institution || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const rollNumber = `STU${Date.now().toString().slice(-6)}`;

    const result = await db.run(
      `
        INSERT INTO users (name, email, password, role, department, roll_number, phone, address, location, study_level, institution, dob, profile_completed)
        VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `,
      [name, email, hash, department, rollNumber, phone, address, location, studyLevel, institution, dob]
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    return res.status(201).json({ user: mapUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    return res.json({ token, user: mapUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/courses', async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM courses ORDER BY name ASC');
    return res.json({ courses: rows.map(mapCourse) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch courses' });
  }
});

app.post('/api/registrations', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId, amount } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course is required' });
    }

    const course = await db.get('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.enrolled_students >= course.max_students) {
      return res.status(400).json({ message: 'Course is full' });
    }

    const existing = await db.get(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (existing) {
      return res.status(409).json({ message: 'Already registered for this course' });
    }

    const nowIso = new Date().toISOString();

    const result = await db.run(
      `
        INSERT INTO registrations (
          student_id, course_id, registration_date, payment_completed,
          amount_paid, progress, current_streak, longest_streak, last_access_date
        ) VALUES (?, ?, ?, 1, ?, 0, 0, 0, ?)
      `,
      [req.user.id, courseId, nowIso, Number(amount || course.price), nowIso]
    );

    await db.run(
      'UPDATE courses SET enrolled_students = enrolled_students + 1 WHERE id = ?',
      [courseId]
    );

    const registration = await db.get(
      `
        SELECT
          r.*,
          u.name AS student_name,
          u.email AS student_email,
          u.phone AS student_phone,
          u.address AS student_address,
          u.department AS student_department,
          u.roll_number AS student_roll_number,
          u.study_level AS student_study_level,
          u.institution AS student_institution,
          u.location AS student_location,
          u.dob AS student_dob,
          c.name AS course_name,
          c.code AS course_code,
          c.category AS course_category
        FROM registrations r
        JOIN users u ON u.id = r.student_id
        JOIN courses c ON c.id = r.course_id
        WHERE r.id = ?
      `,
      [result.lastID]
    );

    return res.status(201).json({ registration: mapRegistration(registration) });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

app.get('/api/registrations/me', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `
        SELECT
          r.*,
          u.name AS student_name,
          u.email AS student_email,
          u.phone AS student_phone,
          u.address AS student_address,
          u.department AS student_department,
          u.roll_number AS student_roll_number,
          u.study_level AS student_study_level,
          u.institution AS student_institution,
          u.location AS student_location,
          u.dob AS student_dob,
          c.name AS course_name,
          c.code AS course_code,
          c.category AS course_category
        FROM registrations r
        JOIN users u ON u.id = r.student_id
        JOIN courses c ON c.id = r.course_id
        WHERE r.student_id = ?
        ORDER BY datetime(r.registration_date) DESC
      `,
      [req.user.id]
    );
    return res.json({ registrations: rows.map(mapRegistration) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch registrations' });
  }
});

app.get('/api/registrations', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `
        SELECT
          r.*,
          u.name AS student_name,
          u.email AS student_email,
          u.department AS student_department,
          u.roll_number AS student_roll_number,
          u.study_level AS student_study_level,
          u.institution AS student_institution,
          u.location AS student_location,
          u.dob AS student_dob,
          c.name AS course_name,
          c.code AS course_code,
          c.category AS course_category
        FROM registrations r
        JOIN users u ON u.id = r.student_id
        JOIN courses c ON c.id = r.course_id
        ORDER BY datetime(r.registration_date) DESC
      `
    );
    return res.json({ registrations: rows.map(mapRegistration) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch all registrations' });
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `
        SELECT id, name, email, role, department, roll_number, phone, address, location, study_level, institution, dob, profile_completed
        FROM users
        ORDER BY id ASC
      `
    );

    const users = rows.map(row => ({
      id: String(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department,
      rollNumber: row.roll_number,
      phone: row.phone,
      address: row.address,
      location: row.location,
      studyLevel: row.study_level,
      institution: row.institution,
      dob: row.dob,
      profileCompleted: Boolean(row.profile_completed),
    }));

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch users' });
  }
});

app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: mapUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch profile' });
  }
});

app.put('/api/users/me', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const {
      name,
      department,
      phone,
      address,
      location,
      studyLevel,
      institution,
      dob,
    } = req.body;

    if (!name || !department || !phone || !address || !location || !studyLevel || !institution || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await db.run(
      `
        UPDATE users
        SET name = ?, department = ?, phone = ?, address = ?, location = ?, study_level = ?, institution = ?, dob = ?, profile_completed = 1
        WHERE id = ?
      `,
      [name, department, phone, address, location, studyLevel, institution, dob, req.user.id]
    );

    const updated = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    return res.json({ user: mapUser(updated) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile' });
  }
});

app.put('/api/admin/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.params;
    const {
      name,
      email,
      department,
      rollNumber,
      phone,
      address,
      location,
      studyLevel,
      institution,
      dob,
    } = req.body;

    if (!name || !email || !department || !rollNumber || !phone || !address || !location || !studyLevel || !institution || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (existing.role === 'admin') {
      return res.status(403).json({ message: 'Cannot edit admin user' });
    }

    const emailOwner = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (emailOwner) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    await db.run(
      `
        UPDATE users
        SET name = ?, email = ?, department = ?, roll_number = ?, phone = ?, address = ?, location = ?, study_level = ?, institution = ?, dob = ?
        WHERE id = ?
      `,
      [name, email, department, rollNumber, phone, address, location, studyLevel, institution, dob, userId]
    );

    const updated = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    return res.json({ user: mapUser(updated) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update user' });
  }
});

app.delete('/api/admin/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.params;
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    const regs = await db.all('SELECT course_id FROM registrations WHERE student_id = ?', [userId]);
    for (const reg of regs) {
      await db.run(
        'UPDATE courses SET enrolled_students = MAX(enrolled_students - 1, 0) WHERE id = ?',
        [reg.course_id]
      );
    }

    await db.run('DELETE FROM content_progress WHERE student_id = ?', [userId]);
    await db.run('DELETE FROM assessments WHERE student_id = ?', [userId]);
    await db.run('DELETE FROM registrations WHERE student_id = ?', [userId]);
    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete user' });
  }
});

app.get('/api/admin/courses', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM courses ORDER BY name ASC');
    return res.json({ courses: rows.map(mapCourse) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch courses' });
  }
});

app.get('/api/admin/registrations', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `
        SELECT
          r.*,
          u.name AS student_name,
          u.email AS student_email,
          u.phone AS student_phone,
          u.address AS student_address,
          u.department AS student_department,
          u.roll_number AS student_roll_number,
          u.study_level AS student_study_level,
          u.institution AS student_institution,
          u.location AS student_location,
          u.dob AS student_dob,
          c.name AS course_name,
          c.code AS course_code,
          c.category AS course_category
        FROM registrations r
        JOIN users u ON u.id = r.student_id
        JOIN courses c ON c.id = r.course_id
        ORDER BY datetime(r.registration_date) DESC
      `
    );
    return res.json({ registrations: rows.map(mapRegistration) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch registrations' });
  }
});

app.post('/api/admin/registrations/:registrationId/attendance', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const { registrationId } = req.params;

    const reg = await db.get('SELECT * FROM registrations WHERE id = ?', [registrationId]);
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const now = new Date();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastAccess = reg.last_access_date ? new Date(reg.last_access_date) : null;
    const lastAccessStart = lastAccess
      ? new Date(lastAccess.getFullYear(), lastAccess.getMonth(), lastAccess.getDate())
      : null;

    let currentStreak = reg.current_streak || 0;
    let longestStreak = reg.longest_streak || 0;

    if (!lastAccessStart) {
      currentStreak = 1;
    } else {
      const diffDays = Math.floor((nowStart - lastAccessStart) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        currentStreak = reg.current_streak;
      } else if (diffDays === 1) {
        currentStreak = reg.current_streak + 1;
      } else {
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    const nextAttendance = Math.min(100, (reg.attendance_percent || 0) + 5);

    await db.run(
      `
        UPDATE registrations
        SET current_streak = ?, longest_streak = ?, last_access_date = ?, attendance_percent = ?
        WHERE id = ?
      `,
      [currentStreak, longestStreak, now.toISOString(), nextAttendance, reg.id]
    );

    return res.json({
      success: true,
      attendancePercent: nextAttendance,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to mark attendance' });
  }
});

app.get('/api/debug/latest-users', async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `
        SELECT id, name, email, role, department, roll_number, phone, address
        FROM users
        ORDER BY id DESC
        LIMIT 10
      `
    );

    return res.json({
      count: rows.length,
      users: rows.map(row => ({
        id: String(row.id),
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department,
        rollNumber: row.roll_number,
        phone: row.phone,
        address: row.address,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch latest users' });
  }
});

app.get('/api/registrations/:courseId/content-progress', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;

    const reg = await db.get(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const rows = await db.all(
      `
        SELECT item_id, progress, updated_at
        FROM content_progress
        WHERE student_id = ? AND course_id = ?
      `,
      [req.user.id, courseId]
    );

    return res.json({
      items: rows.map(row => ({
        itemId: row.item_id,
        progress: row.progress,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch content progress' });
  }
});

app.patch('/api/registrations/:courseId/content-progress', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;
    const { itemId, progress } = req.body;

    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ message: 'Item is required' });
    }

    const numericProgress = Number(progress);
    if (Number.isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const reg = await db.get(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const nowIso = new Date().toISOString();
    const existing = await db.get(
      `
        SELECT id
        FROM content_progress
        WHERE student_id = ? AND course_id = ? AND item_id = ?
      `,
      [req.user.id, courseId, itemId]
    );

    if (existing) {
      await db.run(
        `
          UPDATE content_progress
          SET progress = ?, updated_at = ?
          WHERE id = ?
        `,
        [numericProgress, nowIso, existing.id]
      );
    } else {
      await db.run(
        `
          INSERT INTO content_progress (student_id, course_id, item_id, progress, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [req.user.id, courseId, itemId, numericProgress, nowIso]
      );
    }

    await db.run(
      `
        UPDATE registrations
        SET last_access_date = ?
        WHERE id = ?
      `,
      [nowIso, reg.id]
    );

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update content progress' });
  }
});

app.get('/api/registrations/:courseId/assessments', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;

    const reg = await db.get(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const latestRows = await db.all(
      `
        SELECT a.*
        FROM assessments a
        JOIN (
          SELECT milestone, MAX(datetime(taken_at)) AS latest_time
          FROM assessments
          WHERE student_id = ? AND course_id = ?
          GROUP BY milestone
        ) latest
        ON a.milestone = latest.milestone AND datetime(a.taken_at) = latest.latest_time
        WHERE a.student_id = ? AND a.course_id = ?
      `,
      [req.user.id, courseId, req.user.id, courseId]
    );

    const passedRows = await db.all(
      `
        SELECT DISTINCT milestone
        FROM assessments
        WHERE student_id = ? AND course_id = ? AND passed = 1
      `,
      [req.user.id, courseId]
    );

    return res.json({
      passedMilestones: passedRows.map(row => row.milestone),
      latestAttempts: latestRows.map(row => ({
        milestone: row.milestone,
        score: row.score,
        passed: Boolean(row.passed),
        takenAt: row.taken_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch assessment status' });
  }
});

app.post('/api/registrations/:courseId/assessments', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;
    const { milestone, score } = req.body;

    const numericMilestone = Number(milestone);
    const numericScore = Number(score);
    const allowedMilestones = [25, 50, 75, 100];

    if (!allowedMilestones.includes(numericMilestone)) {
      return res.status(400).json({ message: 'Milestone must be 25, 50, 75, or 100' });
    }

    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100' });
    }

    const reg = await db.get(
      'SELECT id, progress FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const passed = numericScore >= 75;
    const nowIso = new Date().toISOString();

    await db.run(
      `
        INSERT INTO assessments (student_id, course_id, milestone, score, passed, taken_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [req.user.id, courseId, numericMilestone, numericScore, passed ? 1 : 0, nowIso]
    );

    let nextProgress = reg.progress || 0;
    if (passed) {
      nextProgress = Math.max(nextProgress, numericMilestone);
    } else if (numericMilestone > (reg.progress || 0)) {
      nextProgress = Math.max(0, numericMilestone - 25);
    }

    await db.run(
      `
        UPDATE registrations
        SET progress = ?, last_access_date = ?
        WHERE id = ?
      `,
      [nextProgress, nowIso, reg.id]
    );

    return res.json({
      success: true,
      passed,
      score: numericScore,
      requiredScore: 75,
      progress: nextProgress,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit assessment' });
  }
});

app.patch('/api/registrations/:courseId/progress', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;
    const progress = Number(req.body.progress);

    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const reg = await db.get(
      'SELECT id FROM registrations WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await db.run(
      `
        UPDATE registrations
        SET progress = ?, last_access_date = ?
        WHERE id = ?
      `,
      [progress, new Date().toISOString(), reg.id]
    );

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update progress' });
  }
});

app.post('/api/registrations/:courseId/attendance', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { courseId } = req.params;

    const reg = await db.get(
      `
        SELECT *
        FROM registrations
        WHERE student_id = ? AND course_id = ?
      `,
      [req.user.id, courseId]
    );

    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const now = new Date();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastAccess = reg.last_access_date ? new Date(reg.last_access_date) : null;
    const lastAccessStart = lastAccess
      ? new Date(lastAccess.getFullYear(), lastAccess.getMonth(), lastAccess.getDate())
      : null;

    let currentStreak = reg.current_streak || 0;
    let longestStreak = reg.longest_streak || 0;

    if (!lastAccessStart) {
      currentStreak = 1;
    } else {
      const diffDays = Math.floor((nowStart - lastAccessStart) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        currentStreak = reg.current_streak;
      } else if (diffDays === 1) {
        currentStreak = reg.current_streak + 1;
      } else {
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await db.run(
      `
        UPDATE registrations
        SET current_streak = ?, longest_streak = ?, last_access_date = ?
        WHERE id = ?
      `,
      [currentStreak, longestStreak, now.toISOString(), reg.id]
    );

    return res.json({
      success: true,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to mark attendance' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required in environment');
    }

    await initDb();
    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => {
      console.log(`Backend API running on port ${port}`);
    });
  } catch (error) {
    console.error('Startup error:', error.message);
    process.exit(1);
  }
}

startServer();
