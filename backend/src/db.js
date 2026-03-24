const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let db;

async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '..', 'course_registration.db'),
      driver: sqlite3.Database,
    });
  }
  return db;
}

async function initDb() {
  const database = await getDb();

  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      department TEXT,
      roll_number TEXT,
      phone TEXT,
      address TEXT,
      location TEXT,
      study_level TEXT,
      institution TEXT,
      dob TEXT
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      instructor TEXT NOT NULL,
      description TEXT NOT NULL,
      credits INTEGER NOT NULL,
      price INTEGER NOT NULL,
      duration TEXT NOT NULL,
      schedule TEXT NOT NULL,
      max_students INTEGER NOT NULL,
      enrolled_students INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      learn_link TEXT,
      video_link TEXT
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      registration_date TEXT NOT NULL,
      payment_completed INTEGER NOT NULL DEFAULT 1,
      amount_paid INTEGER NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      attendance_percent INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_access_date TEXT,
      UNIQUE(student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS content_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT,
      UNIQUE(student_id, course_id, item_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      milestone INTEGER NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      taken_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `);

  await ensureColumn(database, 'users', 'phone', 'TEXT');
  await ensureColumn(database, 'users', 'address', 'TEXT');
  await ensureColumn(database, 'users', 'location', 'TEXT');
  await ensureColumn(database, 'users', 'study_level', 'TEXT');
  await ensureColumn(database, 'users', 'institution', 'TEXT');
  await ensureColumn(database, 'users', 'dob', 'TEXT');
  await ensureColumn(database, 'users', 'profile_completed', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(database, 'registrations', 'attendance_percent', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(database, 'courses', 'learn_link', 'TEXT');
  await ensureColumn(database, 'courses', 'video_link', 'TEXT');

  await seedUsers(database);
  await seedCourses(database);
  await seedRegistrations(database);
}

async function ensureColumn(database, table, column, definition) {
  const info = await database.all(`PRAGMA table_info(${table})`);
  const exists = info.some(row => row.name === column);
  if (exists) return;
  await database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

async function seedUsers(database) {
  const existing = await database.get('SELECT COUNT(*) AS count FROM users');
  if (existing.count > 0) return;

  const studentHash = await bcrypt.hash('student123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  await database.run(
    `
      INSERT INTO users (name, email, password, role, department, roll_number, phone, address, location, study_level, institution, dob)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      'John Student',
      'student@college.edu',
      studentHash,
      'student',
      'Computer Science',
      '7376232AD203',
      '9876543210',
      '12, College Road, Chennai',
      'Chennai, TN',
      'College',
      'ABC Engineering College',
      '2003-05-12',
      'Admin User',
      'admin@college.edu',
      adminHash,
      'admin',
      'Administration',
      'ADMIN001',
      '9123456780',
      'Admin Block, Campus Office',
      'Chennai, TN',
      'College',
      'Campus Administration',
      '1990-02-20',
    ]
  );
}

async function seedCourses(database) {
  const existingRows = await database.all('SELECT code FROM courses');
  const existingCodes = new Set(existingRows.map(row => row.code));

  const courses = [
    [
      'Data Structures and Algorithms',
      'CS301',
      'Dr. Smith',
      'Learn fundamental data structures and algorithmic techniques',
      4,
      5000,
      '12 weeks',
      'Mon, Wed, Fri - 9:00 AM',
      50,
      35,
      'Computer Science',
      'https://www.khanacademy.org/computing/computer-science/algorithms',
      'https://www.youtube.com/results?search_query=data+structures+and+algorithms+full+course',
    ],
    [
      'Database Management Systems',
      'CS302',
      'Dr. Johnson',
      'Comprehensive coverage of DBMS concepts and SQL',
      3,
      4500,
      '10 weeks',
      'Tue, Thu - 11:00 AM',
      45,
      28,
      'Computer Science',
      'https://www.khanacademy.org/computing/computer-programming/sql',
      'https://www.youtube.com/results?search_query=dbms+sql+full+course',
    ],
    [
      'Mobile Application Development',
      'CS303',
      'Prof. Williams',
      'Build mobile apps using React Native and Flutter',
      4,
      6000,
      '14 weeks',
      'Mon, Wed - 2:00 PM',
      40,
      32,
      'Computer Science',
      'https://www.freecodecamp.org/learn/',
      'https://www.youtube.com/results?search_query=react+native+full+course+beginner',
    ],
    [
      'Machine Learning Fundamentals',
      'CS304',
      'Dr. Brown',
      'Introduction to ML algorithms and applications',
      4,
      7000,
      '12 weeks',
      'Tue, Thu - 3:00 PM',
      35,
      30,
      'Artificial Intelligence',
      'https://www.khanacademy.org/computing/ap-computer-science-principles/data-analysis-101',
      'https://www.youtube.com/results?search_query=machine+learning+full+course',
    ],
    [
      'Web Development',
      'CS305',
      'Prof. Davis',
      'Full-stack web development with modern frameworks',
      3,
      5500,
      '10 weeks',
      'Mon, Wed, Fri - 1:00 PM',
      50,
      42,
      'Computer Science',
      'https://www.freecodecamp.org/learn/',
      'https://www.youtube.com/results?search_query=full+stack+web+development+course',
    ],
    [
      'Computer Networks',
      'CS306',
      'Dr. Miller',
      'Study of network protocols and architectures',
      3,
      4800,
      '11 weeks',
      'Tue, Thu - 10:00 AM',
      40,
      25,
      'Computer Science',
      'https://www.khanacademy.org/computing/computer-science/internet-intro',
      'https://www.youtube.com/results?search_query=computer+networks+full+course',
    ],
    [
      'Operating Systems',
      'CS307',
      'Dr. Thompson',
      'Process management, memory, file systems, and concurrency',
      4,
      5200,
      '12 weeks',
      'Mon, Thu - 10:00 AM',
      45,
      18,
      'B.Tech - CSE',
      'https://ocw.mit.edu/',
      'https://www.youtube.com/results?search_query=operating+systems+full+course',
    ],
    [
      'Object Oriented Programming',
      'CS308',
      'Prof. Lee',
      'Core OOP concepts with Java and design practices',
      3,
      4300,
      '10 weeks',
      'Tue, Fri - 9:30 AM',
      50,
      22,
      'B.Tech - CSE',
      'https://www.geeksforgeeks.org/object-oriented-programming-oop-concept-in-java/',
      'https://www.youtube.com/results?search_query=object+oriented+programming+java+full+course',
    ],
    [
      'Design and Analysis of Algorithms',
      'CS309',
      'Dr. Clark',
      'Greedy, divide-and-conquer, dynamic programming, and graph algorithms',
      4,
      5600,
      '12 weeks',
      'Wed, Fri - 11:00 AM',
      40,
      20,
      'B.Tech - CSE',
      'https://cp-algorithms.com/',
      'https://www.youtube.com/results?search_query=design+and+analysis+of+algorithms+course',
    ],
    [
      'Artificial Intelligence',
      'AI401',
      'Dr. Nguyen',
      'Search, reasoning, and intelligent agents with practical labs',
      4,
      6800,
      '12 weeks',
      'Mon, Wed - 4:00 PM',
      35,
      16,
      'B.Tech - AI',
      'https://www.khanacademy.org/computing/computer-science/ai',
      'https://www.youtube.com/results?search_query=artificial+intelligence+full+course',
    ],
    [
      'Data Science with Python',
      'AI402',
      'Prof. Patel',
      'Data wrangling, visualization, and ML with Python',
      4,
      7200,
      '14 weeks',
      'Tue, Thu - 1:30 PM',
      35,
      14,
      'B.Tech - AI',
      'https://www.kaggle.com/learn',
      'https://www.youtube.com/results?search_query=data+science+with+python+full+course',
    ],
    [
      'Cyber Security Fundamentals',
      'CS401',
      'Dr. Silva',
      'Security principles, cryptography basics, and secure systems',
      3,
      6100,
      '10 weeks',
      'Mon, Wed - 5:00 PM',
      40,
      12,
      'B.Tech - CSE',
      'https://www.khanacademy.org/computing/computer-science/cryptography',
      'https://www.youtube.com/results?search_query=cyber+security+fundamentals+full+course',
    ],
    [
      'Internet of Things',
      'EC401',
      'Prof. Kumar',
      'IoT architecture, sensors, and edge connectivity',
      3,
      5900,
      '10 weeks',
      'Tue, Thu - 2:30 PM',
      40,
      19,
      'B.Tech - ECE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=internet+of+things+full+course',
    ],
    [
      'VLSI Design',
      'EC402',
      'Dr. Rao',
      'Digital circuit design and VLSI fundamentals',
      4,
      6400,
      '12 weeks',
      'Mon, Wed - 11:30 AM',
      35,
      11,
      'B.Tech - ECE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=vlsi+design+full+course',
    ],
    [
      'Signals and Systems',
      'EC403',
      'Prof. Menon',
      'Signal analysis, transforms, and system responses',
      4,
      6000,
      '12 weeks',
      'Tue, Fri - 10:30 AM',
      40,
      17,
      'B.Tech - ECE',
      'https://www.khanacademy.org/science/electrical-engineering/ee-signals',
      'https://www.youtube.com/results?search_query=signals+and+systems+full+course',
    ],
    [
      'Thermodynamics',
      'ME301',
      'Dr. Fernandez',
      'Energy systems, cycles, and applications',
      3,
      5200,
      '10 weeks',
      'Mon, Thu - 2:00 PM',
      45,
      21,
      'B.Tech - ME',
      'https://ocw.mit.edu/courses/2-005-thermal-fluids-engineering-i-fall-2011/',
      'https://www.youtube.com/results?search_query=thermodynamics+full+course',
    ],
    [
      'Manufacturing Processes',
      'ME302',
      'Prof. Iyer',
      'Casting, machining, forming, and production planning',
      3,
      5100,
      '10 weeks',
      'Wed, Fri - 3:00 PM',
      45,
      15,
      'B.Tech - ME',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=manufacturing+processes+full+course',
    ],
    [
      'Structural Analysis',
      'CE301',
      'Dr. Gupta',
      'Statics, beams, frames, and structural design basics',
      4,
      5400,
      '12 weeks',
      'Tue, Thu - 9:00 AM',
      40,
      18,
      'B.Tech - CE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=structural+analysis+full+course',
    ],
    [
      'Transportation Engineering',
      'CE302',
      'Prof. Das',
      'Highways, traffic flow, and transport planning',
      3,
      5300,
      '10 weeks',
      'Mon, Wed - 3:00 PM',
      40,
      13,
      'B.Tech - CE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=transportation+engineering+full+course',
    ],
    [
      'Power Systems',
      'EE301',
      'Dr. Sharma',
      'Generation, transmission, and distribution of electrical power',
      4,
      6200,
      '12 weeks',
      'Tue, Thu - 4:00 PM',
      40,
      16,
      'B.Tech - EEE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=power+systems+full+course',
    ],
    [
      'Control Systems',
      'EE302',
      'Prof. Banerjee',
      'Feedback systems, stability, and controller design',
      3,
      5800,
      '10 weeks',
      'Mon, Fri - 9:00 AM',
      40,
      10,
      'B.Tech - EEE',
      'https://nptel.ac.in/courses',
      'https://www.youtube.com/results?search_query=control+systems+full+course',
    ],
    [
      'Business Analytics',
      'MBA501',
      'Dr. Kapoor',
      'Data-driven decision making and KPI analysis',
      3,
      7500,
      '8 weeks',
      'Sat - 10:00 AM',
      30,
      8,
      'MBA',
      'https://www.khanacademy.org/economics-finance-domain/core-finance',
      'https://www.youtube.com/results?search_query=business+analytics+full+course',
    ],
    [
      'Product Design Basics',
      'DES201',
      'Prof. Nair',
      'Design thinking, prototyping, and usability principles',
      3,
      5000,
      '8 weeks',
      'Fri - 2:00 PM',
      30,
      9,
      'Design',
      'https://www.interaction-design.org/literature',
      'https://www.youtube.com/results?search_query=product+design+basics+course',
    ],
    [
      'Cloud Computing Fundamentals',
      'CS310',
      'Dr. Verma',
      'Cloud services, deployment models, and distributed systems',
      3,
      6400,
      '10 weeks',
      'Tue, Thu - 5:00 PM',
      45,
      12,
      'Computer Science',
      'https://www.freecodecamp.org/learn/',
      'https://www.youtube.com/results?search_query=cloud+computing+full+course',
    ],
    [
      'DevOps Essentials',
      'CS311',
      'Prof. Sen',
      'CI/CD, containers, and infrastructure automation',
      3,
      6200,
      '9 weeks',
      'Mon, Wed - 6:00 PM',
      40,
      9,
      'Computer Science',
      'https://www.freecodecamp.org/learn/',
      'https://www.youtube.com/results?search_query=devops+full+course',
    ],
    [
      'UI/UX Design',
      'DES202',
      'Prof. Mehta',
      'User research, wireframing, and usability testing',
      3,
      4800,
      '8 weeks',
      'Sat - 2:00 PM',
      30,
      7,
      'Design',
      'https://www.interaction-design.org/literature',
      'https://www.youtube.com/results?search_query=ui+ux+design+full+course',
    ],
    [
      'Digital Marketing',
      'MBA502',
      'Dr. Malhotra',
      'SEO, social media, and analytics-driven campaigns',
      3,
      5200,
      '8 weeks',
      'Sat - 4:00 PM',
      35,
      10,
      'MBA',
      'https://learndigital.withgoogle.com/digitalgarage',
      'https://www.youtube.com/results?search_query=digital+marketing+full+course',
    ],
    [
      'Python for Everybody',
      'CS312',
      'Prof. Rao',
      'Python basics, automation, and data handling',
      4,
      4900,
      '10 weeks',
      'Mon, Thu - 1:30 PM',
      50,
      20,
      'Computer Science',
      'https://docs.python.org/3/tutorial/',
      'https://www.youtube.com/results?search_query=python+full+course+for+beginners',
    ],
    [
      'Frontend Web Development',
      'CS313',
      'Dr. Joseph',
      'HTML, CSS, and JavaScript fundamentals',
      3,
      4300,
      '8 weeks',
      'Tue, Fri - 2:00 PM',
      50,
      24,
      'Computer Science',
      'https://www.w3schools.com/',
      'https://www.youtube.com/results?search_query=html+css+javascript+full+course',
    ],
    [
      'Java Programming',
      'CS314',
      'Prof. Mathew',
      'Core Java, OOP, and collections',
      3,
      4700,
      '9 weeks',
      'Wed, Fri - 4:30 PM',
      45,
      19,
      'Computer Science',
      'https://docs.oracle.com/javase/tutorial/',
      'https://www.youtube.com/results?search_query=java+full+course',
    ],
    [
      'Data Visualization',
      'AI403',
      'Dr. Iqbal',
      'Charts, dashboards, and storytelling with data',
      3,
      5200,
      '8 weeks',
      'Tue, Thu - 9:00 AM',
      40,
      15,
      'B.Tech - AI',
      'https://www.kaggle.com/learn/data-visualization',
      'https://www.youtube.com/results?search_query=data+visualization+full+course',
    ],
    [
      'Blockchain Basics',
      'CS315',
      'Dr. Fernandes',
      'Distributed ledgers, consensus, and smart contracts',
      3,
      6800,
      '9 weeks',
      'Mon, Wed - 8:00 AM',
      35,
      12,
      'Computer Science',
      'https://www.freecodecamp.org/learn/',
      'https://www.youtube.com/results?search_query=blockchain+full+course',
    ],
  ];

  for (const course of courses) {
    if (!existingCodes.has(course[1])) {
      await database.run(
        `
          INSERT INTO courses (
            name, code, instructor, description, credits, price, duration, schedule,
            max_students, enrolled_students, category, learn_link, video_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        course
      );
    } else {
      await database.run(
        `
          UPDATE courses
          SET learn_link = COALESCE(learn_link, ?),
              video_link = COALESCE(video_link, ?)
          WHERE code = ?
        `,
        [course[11], course[12], course[1]]
      );
    }
  }
}

async function seedRegistrations(database) {
  const existing = await database.get('SELECT COUNT(*) AS count FROM registrations');
  if (existing.count > 0) return;

  const student = await database.get('SELECT id FROM users WHERE email = ?', ['student@college.edu']);
  const course = await database.get('SELECT id FROM courses WHERE code = ?', ['CS301']);

  if (!student || !course) return;

  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

  await database.run(
    `
      INSERT INTO registrations (
        student_id, course_id, registration_date, payment_completed, amount_paid,
        progress, attendance_percent, current_streak, longest_streak, last_access_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      student.id,
      course.id,
      fifteenDaysAgo.toISOString(),
      1,
      5000,
      45,
      60,
      7,
      12,
      now.toISOString(),
    ]
  );
}

function mapUser(userRow) {
  return {
    id: String(userRow.id),
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    department: userRow.department,
    rollNumber: userRow.roll_number,
    phone: userRow.phone,
    address: userRow.address,
    location: userRow.location,
    studyLevel: userRow.study_level,
    institution: userRow.institution,
    dob: userRow.dob,
    profileCompleted: Boolean(userRow.profile_completed),
  };
}

function mapCourse(courseRow) {
  return {
    id: String(courseRow.id),
    name: courseRow.name,
    code: courseRow.code,
    instructor: courseRow.instructor,
    description: courseRow.description,
    credits: courseRow.credits,
    price: courseRow.price,
    duration: courseRow.duration,
    schedule: courseRow.schedule,
    maxStudents: courseRow.max_students,
    enrolledStudents: courseRow.enrolled_students,
    category: courseRow.category,
    learnLink: courseRow.learn_link,
    videoLink: courseRow.video_link,
  };
}

function mapRegistration(regRow) {
  return {
    id: String(regRow.id),
    studentId: String(regRow.student_id),
    studentName: regRow.student_name,
    studentEmail: regRow.student_email,
    studentPhone: regRow.student_phone,
    studentAddress: regRow.student_address,
    studentDepartment: regRow.student_department,
    studentRollNumber: regRow.student_roll_number,
    studentStudyLevel: regRow.student_study_level,
    studentInstitution: regRow.student_institution,
    studentLocation: regRow.student_location,
    studentDob: regRow.student_dob,
    courseId: String(regRow.course_id),
    courseName: regRow.course_name,
    courseCode: regRow.course_code,
    courseCategory: regRow.course_category,
    registrationDate: regRow.registration_date,
    paymentCompleted: Boolean(regRow.payment_completed),
    amountPaid: regRow.amount_paid,
    progress: regRow.progress,
    attendancePercent: regRow.attendance_percent ?? 0,
    currentStreak: regRow.current_streak,
    longestStreak: regRow.longest_streak,
    lastAccessDate: regRow.last_access_date,
  };
}

module.exports = {
  getDb,
  initDb,
  mapUser,
  mapCourse,
  mapRegistration,
};
