import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, UPLOAD_DIR, DATA_DIR } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

/* ---------- JWT secret: env or generated once and persisted in data dir ---------- */
function resolveSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) return process.env.JWT_SECRET;
  const file = path.join(DATA_DIR, '.jwt-secret');
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch {
    /* create below */
  }
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}
const SECRET = resolveSecret();
const COOKIE = 'kave_session';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'sameorigin' },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

/* ---------------------------- validation helpers ---------------------------- */
const str = (v, max = 400) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';
const email = (v) => {
  const s = str(v, 200).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s) ? s : '';
};
const mobile = (v) => {
  const s = str(v, 40);
  return /^[+]?[0-9()\-\s.]{6,25}$/.test(s) ? s : '';
};
const oneOf = (v, list, fallback = list[0]) => (list.includes(v) ? v : fallback);

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

/* --------------------------------- auth ---------------------------------- */
const sign = (admin) =>
  jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, SECRET, { expiresIn: '7d' });

function setSession(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 3600 * 1000,
    path: '/',
  });
}

function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, SECRET);
    const admin = db.prepare('SELECT id, email, name FROM admins WHERE id = ?').get(payload.id);
    if (!admin) return res.status(401).json({ error: 'Authentication required' });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please sign in again' });
  }
}

const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, first: now };
  if (now - entry.first > 15 * 60 * 1000) {
    loginAttempts.set(key, { count: 1, first: now });
    return next();
  }
  if (entry.count >= 10) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
  next();
}

app.post('/api/auth/login', rateLimitLogin, (req, res) => {
  const mail = email(req.body?.email);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!mail || !password) return res.status(400).json({ error: 'Email and password are required' });

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(mail);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  setSession(res, sign(admin));
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ admin: req.admin }));

app.post('/api/auth/password', requireAdmin, (req, res) => {
  const current = String(req.body?.currentPassword || '');
  const next = String(req.body?.newPassword || '');
  if (next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(current, admin.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(
    bcrypt.hashSync(next, 12),
    admin.id,
  );
  res.json({ ok: true });
});

/* -------------------------------- uploads -------------------------------- */
const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = ALLOWED.get(file.mimetype) || path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new Error('Only JPG, PNG, WebP, AVIF or GIF images are allowed'));
    cb(null, true);
  },
});

app.post('/api/uploads', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

/* ------------------------------ public site ------------------------------ */
function contentMap() {
  const rows = db.prepare('SELECT key, value FROM content').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

app.get('/api/site', (_req, res) => {
  const projects = db.prepare('SELECT * FROM projects WHERE published = 1 ORDER BY sort, id').all();
  const gallery = db.prepare('SELECT * FROM gallery WHERE published = 1 ORDER BY sort, id').all();
  const services = db.prepare('SELECT * FROM services WHERE published = 1 ORDER BY sort, id').all();
  const pricing = db
    .prepare('SELECT * FROM pricing ORDER BY sort, id')
    .all()
    .map((p) => ({ ...p, features: JSON.parse(p.features || '[]') }));

  const categories = ['All', ...new Set(projects.map((p) => p.category))];
  const galleryCategories = ['All', ...new Set(gallery.map((g) => g.category))];

  res.json({ content: contentMap(), services, projects, gallery, pricing, categories, galleryCategories });
});

/* ------------------------------- bookings -------------------------------- */
app.post('/api/bookings', (req, res) => {
  const name = str(req.body?.name, 120);
  const mail = email(req.body?.email);
  const phone = mobile(req.body?.mobile);
  const date = str(req.body?.date, 20);
  const time = str(req.body?.time, 20);
  const service = str(req.body?.service, 120);
  const propertyType = str(req.body?.propertyType ?? req.body?.property_type, 80);
  const message = str(req.body?.message, 2000);

  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your full name';
  if (!mail) errors.email = 'Please enter a valid email address';
  if (!phone) errors.mobile = 'Please enter a valid mobile number';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = 'Please choose a preferred date';
  else if (Number.isNaN(new Date(`${date}T00:00:00`).getTime())) errors.date = 'Please choose a valid date';
  else if (date < new Date().toISOString().slice(0, 10)) errors.date = 'Please choose a future date';
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = 'Please choose a preferred time';
  if (!service) errors.service = 'Please choose a service';

  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form', fields: errors });

  const info = db
    .prepare(
      'INSERT INTO bookings (name, email, mobile, date, time, service, property_type, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(name, mail, phone, date, time, service, propertyType, message);

  res.status(201).json({
    booking: db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid),
    message: `Thank you, ${name.split(' ')[0]}. Your consultation request has been received — the studio will confirm within two working days.`,
  });
});

/* ------------------------------- contacts -------------------------------- */
app.post('/api/contacts', (req, res) => {
  const name = str(req.body?.name, 120);
  const mail = email(req.body?.email);
  const phone = req.body?.mobile ? mobile(req.body.mobile) : '';
  const message = str(req.body?.message, 3000);

  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your name';
  if (!mail) errors.email = 'Please enter a valid email address';
  if (req.body?.mobile && !phone) errors.mobile = 'Please enter a valid mobile number';
  if (message.length < 10) errors.message = 'Please add at least a short message';

  if (Object.keys(errors).length) return res.status(400).json({ error: 'Please check the form', fields: errors });

  db.prepare('INSERT INTO contacts (name, email, mobile, message) VALUES (?, ?, ?, ?)').run(
    name,
    mail,
    phone,
    message,
  );
  res.status(201).json({ message: 'Thank you — your message reached the studio. We reply within two working days.' });
});

/* ------------------------------- admin CRUD ------------------------------ */
app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const count = (sql) => db.prepare(sql).get().c;
  res.json({
    content: contentMap(),
    services: db.prepare('SELECT * FROM services ORDER BY sort, id').all(),
    projects: db.prepare('SELECT * FROM projects ORDER BY sort, id').all(),
    gallery: db.prepare('SELECT * FROM gallery ORDER BY sort, id').all(),
    pricing: db
      .prepare('SELECT * FROM pricing ORDER BY sort, id')
      .all()
      .map((p) => ({ ...p, features: JSON.parse(p.features || '[]') })),
    bookings: db.prepare('SELECT * FROM bookings ORDER BY id DESC').all(),
    contacts: db.prepare('SELECT * FROM contacts ORDER BY id DESC').all(),
    stats: {
      bookings: count('SELECT COUNT(*) AS c FROM bookings'),
      pending: count("SELECT COUNT(*) AS c FROM bookings WHERE status = 'Pending'"),
      contacts: count('SELECT COUNT(*) AS c FROM contacts'),
      newContacts: count("SELECT COUNT(*) AS c FROM contacts WHERE status = 'New'"),
      projects: count('SELECT COUNT(*) AS c FROM projects'),
      services: count('SELECT COUNT(*) AS c FROM services'),
      gallery: count('SELECT COUNT(*) AS c FROM gallery'),
    },
  });
});

app.put('/api/admin/content', requireAdmin, (req, res) => {
  const entries = Object.entries(req.body || {}).filter(([k]) => /^[a-z0-9_]{1,64}$/.test(k));
  if (!entries.length) return res.status(400).json({ error: 'No content fields supplied' });
  const stmt = db.prepare(
    'INSERT INTO content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  );
  db.transaction(() => {
    for (const [k, v] of entries) stmt.run(k, str(v, 6000));
  })();
  res.json({ content: contentMap() });
});

/* services */
app.post('/api/admin/services', requireAdmin, (req, res) => {
  const title = str(req.body?.title, 160);
  if (!title) return res.status(400).json({ error: 'Service title is required' });
  const sort = Number(db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM services').get().s);
  const info = db
    .prepare('INSERT INTO services (title, description, image, bullet, sort, published) VALUES (?, ?, ?, ?, ?, ?)')
    .run(
      title,
      str(req.body?.description, 1200),
      str(req.body?.image, 1000),
      str(req.body?.bullet, 120),
      sort,
      req.body?.published === 0 ? 0 : 1,
    );
  res.status(201).json(db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });
  const title = req.body?.title !== undefined ? str(req.body.title, 160) : existing.title;
  if (!title) return res.status(400).json({ error: 'Service title is required' });
  db.prepare('UPDATE services SET title=?, description=?, image=?, bullet=?, published=? WHERE id=?').run(
    title,
    req.body?.description !== undefined ? str(req.body.description, 1200) : existing.description,
    req.body?.image !== undefined ? str(req.body.image, 1000) : existing.image,
    req.body?.bullet !== undefined ? str(req.body.bullet, 120) : existing.bullet,
    req.body?.published !== undefined ? (req.body.published ? 1 : 0) : existing.published,
    id,
  );
  res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(id));
});

app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* projects */
const PROJECT_FIELDS = ['title', 'category', 'location', 'year', 'image1', 'image2', 'image3', 'description'];
app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const title = str(req.body?.title, 160);
  if (!title) return res.status(400).json({ error: 'Project title is required' });
  const sort = Number(db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM projects').get().s);
  const info = db
    .prepare(
      'INSERT INTO projects (title, category, location, year, description, image1, image2, image3, sort, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      title,
      str(req.body?.category, 80) || 'Residential',
      str(req.body?.location, 120),
      str(req.body?.year, 12),
      str(req.body?.description, 2000),
      str(req.body?.image1, 1000),
      str(req.body?.image2, 1000),
      str(req.body?.image3, 1000),
      sort,
      req.body?.published === 0 ? 0 : 1,
    );
  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/admin/projects/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  const merged = { ...existing };
  for (const field of PROJECT_FIELDS) {
    if (req.body?.[field] !== undefined) {
      merged[field] = str(req.body[field], field === 'description' ? 2000 : 1000);
    }
  }
  if (!merged.title) return res.status(400).json({ error: 'Project title is required' });
  db.prepare(
    'UPDATE projects SET title=?, category=?, location=?, year=?, description=?, image1=?, image2=?, image3=?, published=? WHERE id=?',
  ).run(
    merged.title,
    merged.category,
    merged.location,
    merged.year,
    merged.description,
    merged.image1,
    merged.image2,
    merged.image3,
    req.body?.published !== undefined ? (req.body.published ? 1 : 0) : existing.published,
    id,
  );
  res.json(db.prepare('SELECT * FROM projects WHERE id = ?').get(id));
});

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* gallery */
app.post('/api/admin/gallery', requireAdmin, (req, res) => {
  const image = str(req.body?.image, 1000);
  if (!image) return res.status(400).json({ error: 'Gallery image is required' });
  const sort = Number(db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM gallery').get().s);
  const info = db
    .prepare('INSERT INTO gallery (title, category, image, sort, published) VALUES (?, ?, ?, ?, ?)')
    .run(
      str(req.body?.title, 160) || 'Untitled',
      str(req.body?.category, 80) || 'Living Rooms',
      image,
      sort,
      req.body?.published === 0 ? 0 : 1,
    );
  res.status(201).json(db.prepare('SELECT * FROM gallery WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Image not found' });
  db.prepare('UPDATE gallery SET title=?, category=?, image=?, published=? WHERE id=?').run(
    req.body?.title !== undefined ? str(req.body.title, 160) : existing.title,
    req.body?.category !== undefined ? str(req.body.category, 80) : existing.category,
    req.body?.image !== undefined ? str(req.body.image, 1000) : existing.image,
    req.body?.published !== undefined ? (req.body.published ? 1 : 0) : existing.published,
    id,
  );
  res.json(db.prepare('SELECT * FROM gallery WHERE id = ?').get(id));
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* pricing */
function parseFeatures(input) {
  const list = Array.isArray(input)
    ? input
    : String(input || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
  return JSON.stringify(list.map((s) => str(s, 200)).filter(Boolean).slice(0, 20));
}

app.post('/api/admin/pricing', requireAdmin, (req, res) => {
  const name = str(req.body?.name, 120);
  if (!name) return res.status(400).json({ error: 'Package name is required' });
  const sort = Number(db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS s FROM pricing').get().s);
  const info = db
    .prepare(
      'INSERT INTO pricing (name, price_label, price_note, description, features, highlight, sort) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      name,
      str(req.body?.price_label, 80) || 'Custom quote',
      str(req.body?.price_note, 120),
      str(req.body?.description, 800),
      parseFeatures(req.body?.features),
      req.body?.highlight ? 1 : 0,
      sort,
    );
  res.status(201).json({
    ...db.prepare('SELECT * FROM pricing WHERE id = ?').get(info.lastInsertRowid),
  });
});

app.put('/api/admin/pricing/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM pricing WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Package not found' });
  const name = req.body?.name !== undefined ? str(req.body.name, 120) : existing.name;
  if (!name) return res.status(400).json({ error: 'Package name is required' });
  db.prepare(
    'UPDATE pricing SET name=?, price_label=?, price_note=?, description=?, features=?, highlight=? WHERE id=?',
  ).run(
    name,
    req.body?.price_label !== undefined ? str(req.body.price_label, 80) : existing.price_label,
    req.body?.price_note !== undefined ? str(req.body.price_note, 120) : existing.price_note,
    req.body?.description !== undefined ? str(req.body.description, 800) : existing.description,
    req.body?.features !== undefined ? parseFeatures(req.body.features) : existing.features,
    req.body?.highlight !== undefined ? (req.body.highlight ? 1 : 0) : existing.highlight,
    id,
  );
  res.json(JSON.parse(JSON.stringify(db.prepare('SELECT * FROM pricing WHERE id = ?').get(id))));
});

app.delete('/api/admin/pricing/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM pricing WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* bookings */
app.patch('/api/admin/bookings/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Booking not found' });
  const status = oneOf(req.body?.status, BOOKING_STATUSES, existing.status);
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(id));
});

app.delete('/api/admin/bookings/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* contacts */
app.patch('/api/admin/contacts/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Enquiry not found' });
  const status = oneOf(req.body?.status, ['New', 'Read', 'Replied', 'Archived'], existing.status);
  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
  res.json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(id));
});

app.delete('/api/admin/contacts/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

/* ------------------------------ static + SPA ----------------------------- */
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  }),
);

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image must be smaller than 8 MB' });
  if (err) return res.status(400).json({ error: err.message || 'Request failed' });
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KAVÉ studio server listening on 0.0.0.0:${PORT}`);
});
