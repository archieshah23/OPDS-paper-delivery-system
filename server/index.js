const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const port = process.env.port || 3000;
const app = express();
const pool = require('./db/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();


BigInt.prototype.toJSON = function () {
  return this.toString();
};
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} from ${req.headers.origin}`);
  next();
});

app.use(bodyparser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
  fileFilter: (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF, JPG, PNG allowed'));
  }
  cb(null, true);
},

});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.listen(port, () => {
  console.log(`server is listening on port-${port}`);
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { subjectId } = req.body;
  const file = req.file;

  if (!file || !subjectId) {
    return res.status(400).json({ message: 'Missing file or subjectId' });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO subject_documents (subject_id, file_name) VALUES (?, ?)',
      [subjectId, file.filename]
    );
    conn.release();
    res.status(200).json({ message: 'File uploaded and recorded in DB' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB error' });
  }
});

app.get('/api/documents/:subjectId', async (req, res) => {
  const { subjectId } = req.params;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'SELECT file_name FROM subject_documents WHERE subject_id = ? ORDER BY id DESC',
      [subjectId]
    );
    conn.release();
    res.status(200).json({ files: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

app.post('/api/register-college', async (req, res) => {
  const { clgname, macadd, courses } = req.body;
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO colleges (name, mac_address) VALUES (?, ?)',
      [clgname, macadd]
    );
    const collegeId = result.insertId;
    for (const courseName of courses) {
      const courseRes = await conn.query(
        'SELECT id FROM courses WHERE name = ?',
        [courseName]
      );
      if (courseRes.length) {
        const courseId = courseRes[0].id;
        await conn.query(
          'INSERT INTO college_courses (college_id, course_id) VALUES (?, ?)',
          [collegeId, courseId]
        );
      }
    }
    conn.release();
    res.status(200).json({ message: 'College registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'error registering college' });
  }
});

const pendingUsers = new Map(); // stores users temporarily

app.post('/api/register-user', async (req, res) => {
  const { firstname, lastname, email, phone, password, category, college } = req.body;
  const hashPass=await bcrypt.hash(password, saltRounds);
  try {
    const conn = await pool.getConnection();
    const roleResult = await conn.query(
      'SELECT id FROM roles WHERE LOWER(name)=?',
      [category.toLowerCase()]
    );
    conn.release();

    if (!roleResult.length) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    pendingUsers.set(token, {
      firstname,
      lastname,
      email,
      phone,
      password:hashPass,
      roleId: roleResult[0].id,
      college,
    });

    // const verificationLink = `http://localhost:3000/api/verify?token=${token}`;
        const verificationLink = `http://192.168.0.17:3000/api/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Verify your email',
      html: `<p>Click the link to verify: <a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    res.status(200).json(
    {
      message: "Verification email sent",
      emailSent: true, 
    });

  } catch (error) {
    console.error('Email send error', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

app.get('/api/verify', async (req, res) => {
  const token = req.query.token;

  if (!pendingUsers.has(token)) {
    return res.status(400).send('Invalid or expired token');
  }

  const userData = pendingUsers.get(token);
  pendingUsers.delete(token);

  try {
    const conn = await pool.getConnection();
    let collegeId = null;

    if (userData.college) {
      const clgResult = await conn.query(
        'SELECT id from colleges WHERE name= ?',
        [userData.college]
      );
      if (clgResult.length > 0) {
        collegeId = clgResult[0].id;
      }
    }

    await conn.query(
      `INSERT INTO users 
      (first_name, last_name, email, phone, password, role_id, college_id, is_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.firstname,
        userData.lastname,
        userData.email,
        userData.phone,
        userData.password,
        userData.roleId,
        collegeId,
        true
      ]
    );
    conn.release();

    res.send(`
      <html>
        <head><title>Verified</title></head>
        <body>
          <h2>Email verified successfully!</h2>
          <script>
            localStorage.setItem("emailVerified", "true");
          </script>
        </body>
      </html>
    `);

  } catch (err) {
    console.error('Error verifying user', err);
    res.status(500).send('Server error');
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query(
      `SELECT u.id,u.first_name,u.last_name,u.email,u.phone,r.name 
       AS role,c.name AS college 
       FROM users u 
       JOIN roles r ON u.role_id=r.id 
       LEFT JOIN colleges c ON u.college_id=c.id`
    );
    conn.release();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/colleges', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const colleges = await conn.query(
      'SELECT id, name, mac_address FROM colleges'
    );

    for (const college of colleges) {
      const courses = await conn.query(
        `SELECT c.id, c.name FROM courses c
         JOIN college_courses cc ON c.id = cc.course_id
         WHERE cc.college_id = ?`,
        [college.id]
      );

      for (const course of courses) {
        const semesters = await conn.query(
          `SELECT id, name FROM semesters WHERE course_id = ?`,
          [course.id]
        );

        for (const sem of semesters) {
          const subjects = await conn.query(
            `SELECT id,name, exam_date AS date FROM subjects WHERE semester_id = ?`,
            [sem.id]
          );
          sem.subjects = subjects;
        }
        course.semesters = semesters;
      }
      college.courses = courses;
    }
    conn.release();
    res.json({ colleges });
  } catch (err) {
    console.error('Error fetching colleges:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents-with-subjects', async (req, res) => {
  const collegeId = req.query.collegeId;
  try {
    const conn = await pool.getConnection();

    const query = `
      SELECT
        sd.subject_id,
        s.name AS subject_name,
        sd.file_name,
        col.id AS college_id,
        col.name AS college_name,
        cr.name AS course_name,
        sem.name AS semester_name
      FROM subject_documents sd
      JOIN subjects s ON s.id = sd.subject_id
      JOIN semesters sem ON s.semester_id = sem.id
      JOIN courses cr ON sem.course_id = cr.id
      JOIN college_courses cc ON cc.course_id = cr.id AND cc.college_id = ?
      JOIN colleges col ON col.id = cc.college_id
      ORDER BY sd.id DESC
    `;

    const results = await conn.query(query, [collegeId]);
    conn.release();

    res.status(200).json({ files: results });
  } catch (err) {
    console.error("Error fetching documents with subject info:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});



app.get('/api/courses', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const course = await conn.query('SELECT id , name FROM courses');
    conn.release();
    res.json({ course });
  } catch (err) {
    console.error('Error fetching courses', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((req, res) => {
  console.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found' });
});
