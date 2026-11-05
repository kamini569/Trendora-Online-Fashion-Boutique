import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function resolveDataDir() {
  const candidates = [process.env.DATA_DIR, '/data', path.join(root, 'server', 'data')].filter(Boolean);
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      /* try next */
    }
  }
  throw new Error('No writable data directory available');
}

export const DATA_DIR = resolveDataDir();
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'kave.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Studio Admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  bullet TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Residential',
  location TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image1 TEXT NOT NULL DEFAULT '',
  image2 TEXT NOT NULL DEFAULT '',
  image3 TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Living Rooms',
  image TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price_label TEXT NOT NULL DEFAULT 'Custom quote',
  price_note TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '[]',
  highlight INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const DEFAULT_CONTENT = {
  studio_name: 'KAVÉ',
  tagline: 'Spaces that feel like you.',
  hero_heading: 'Designing Spaces.',
  hero_heading_accent: 'Creating Experiences.',
  hero_intro:
    'KAVÉ is an interior design studio shaping calm, considered interiors for people who care how a room feels — not just how it looks.',
  hero_image: img('photo-1616486338812-3dadae4b4ace', 2000),
  hero_stat_1_value: '12',
  hero_stat_1_label: 'Years of studio practice',
  hero_stat_2_value: '180+',
  hero_stat_2_label: 'Spaces delivered',
  hero_stat_3_value: '9',
  hero_stat_3_label: 'Design awards',

  about_eyebrow: 'The Studio',
  about_title: 'Interiors with intent.',
  about_paragraph:
    'KAVÉ is a creative interior design studio built around one belief: a home should feel like the people who live in it. We work slowly and deliberately — listening first, sketching second, and detailing until every junction, texture and shadow feels resolved. From a single living room to a full residence, our team balances craftsmanship with quiet, contemporary restraint.',
  about_image: img('photo-1600210492486-724fe5c67fb0', 1200),
  about_image_small: img('photo-1618221195710-dd6b41faaea6', 900),
  about_pillar_1_title: 'Philosophy',
  about_pillar_1_text:
    'We design around how you actually live — the morning light, the way you host, the things you never want to hide.',
  about_pillar_2_title: 'Creativity',
  about_pillar_2_text:
    'Unexpected material pairings, sculptural silhouettes and a palette that stays beautiful a decade from now.',
  about_pillar_3_title: 'Quality',
  about_pillar_3_text:
    'Trusted makers, honest materials and documentation detailed enough for any contractor to build precisely.',
  about_pillar_4_title: 'Detail',
  about_pillar_4_text:
    'Joinery, lighting temperature, switch heights. The small decisions are the ones you feel every day.',

  services_eyebrow: 'What we do',
  services_title: 'Our Services',
  services_intro:
    'Full-service interior design, from the first spatial study to the final styled photograph.',

  projects_eyebrow: 'Selected work',
  projects_title: 'Our Projects',
  projects_intro:
    'A selection of residences, apartments and workplaces designed end to end by the studio.',

  pricing_eyebrow: 'Engagements',
  pricing_title: 'Pricing Packages',
  pricing_intro:
    'Three ways to work with the studio. Every package is scoped to your floor plan and finishes.',

  gallery_eyebrow: 'Archive',
  gallery_title: 'Gallery',
  gallery_intro: 'Living rooms, bedrooms, kitchens, workplaces and details from recent projects.',

  booking_eyebrow: 'Book a consultation',
  booking_title: 'Reserve a studio consultation.',
  booking_intro:
    'Tell us about your space and we will come back within two working days with available times and what to prepare.',

  contact_eyebrow: 'Say hello',
  contact_title: 'Let’s talk about your space.',
  contact_intro:
    'Prefer to write first? Send a note and we will reply with next steps, timelines and indicative investment.',

  contact_email: 'hello@kavestudio.example',
  contact_phone: '+00 000 000 0000',
  contact_address: 'Studio address — update in Admin → Content',
  contact_hours: 'Monday to Friday, 10:00 – 18:00',
  whatsapp_number: '000000000000',
  social_instagram: 'https://instagram.com/',
  social_pinterest: 'https://pinterest.com/',
  social_facebook: 'https://facebook.com/',
  map_query: 'Interior design studio',
  footer_note: 'Interior design studio. Residential, hospitality and workplace interiors.',
};

const DEFAULT_SERVICES = [
  {
    title: 'Residential Interior Design',
    description:
      'End-to-end design for houses and apartments — layouts, joinery, materials, lighting and styling, documented for your contractor.',
    image: img('photo-1600585154340-be6161a56a0c', 1200),
    bullet: 'Full home, turnkey',
  },
  {
    title: 'Living Room Design',
    description:
      'Comfort-led living spaces with considered seating geometry, layered lighting and a palette that photographs as beautifully as it lives.',
    image: img('photo-1616486338812-3dadae4b4ace', 1200),
    bullet: 'Everyday hosting',
  },
  {
    title: 'Bedroom Design',
    description:
      'Quiet, restorative bedrooms: tactile textiles, blackout planning, warm dimmable light and generous storage designed out of sight.',
    image: img('photo-1616594039964-ae9021a400a0', 1200),
    bullet: 'Rest and retreat',
  },
  {
    title: 'Kitchen Design',
    description:
      'Working kitchens planned around real cooking — ergonomic triangles, durable surfaces and cabinetry detailed to the millimetre.',
    image: img('photo-1556909212-d5b604d0c90d', 1200),
    bullet: 'Function first',
  },
  {
    title: 'Office Interior Design',
    description:
      'Studios and home offices that support focus and long days, with acoustic care, cable management and daylight-aware desk planning.',
    image: img('photo-1497366216548-37526070297c', 1200),
    bullet: 'Focused workspaces',
  },
  {
    title: 'Commercial Interior Design',
    description:
      'Hospitality and retail interiors that carry your brand into the room — durable, photogenic and operationally practical.',
    image: img('photo-1524758631624-e2822e304c36', 1200),
    bullet: 'Brand in space',
  },
  {
    title: 'Space Planning',
    description:
      'Measured plans, circulation studies and furniture layouts that make a small footprint feel generous and a large one feel calm.',
    image: img('photo-1600607687920-4e2a09cf159d', 1200),
    bullet: 'Plans that work',
  },
  {
    title: '3D Interior Visualization',
    description:
      'Photoreal renders and walkthroughs so you approve materials, lighting and proportion before anything is ordered or built.',
    image: img('photo-1600566753086-00f18fb6b3ea', 1200),
    bullet: 'See it first',
  },
];

const DEFAULT_PROJECTS = [
  {
    title: 'The Ivy Residence',
    category: 'Luxury Homes',
    location: 'Hillside Estate',
    year: '2025',
    description:
      'A five-bedroom family home reworked around a double-height stair hall. Lime plaster, smoked oak and a warm ivory palette hold the daylight, while a bespoke kitchen island anchors the daily rhythm of the house.',
    image1: img('photo-1600585154340-be6161a56a0c', 1100),
    image2: img('photo-1600607687939-ce8a6c25118c', 1100),
    image3: img('photo-1600210492486-724fe5c67fb0', 1400),
  },
  {
    title: 'Aurelia Apartment',
    category: 'Modern Apartments',
    location: 'City Centre',
    year: '2025',
    description:
      'A compact two-bedroom apartment opened into one continuous living volume. Full-height joinery hides everything, a soft taupe sofa grounds the room, and brass details catch the evening light.',
    image1: img('photo-1618221195710-dd6b41faaea6', 1100),
    image2: img('photo-1616486338812-3dadae4b4ace', 1100),
    image3: img('photo-1556228453-efd6c1ff04f6', 1400),
  },
  {
    title: 'Maison Kave Kitchen',
    category: 'Kitchen Interiors',
    location: 'Garden House',
    year: '2024',
    description:
      'A working kitchen for a family that cooks every day. Honed stone, a fluted island and concealed appliances keep the room social without ever looking busy.',
    image1: img('photo-1556909212-d5b604d0c90d', 1100),
    image2: img('photo-1556911220-bff31c812dba', 1100),
    image3: img('photo-1584622650111-993a426fbf0a', 1400),
  },
  {
    title: 'Northlight Studio Office',
    category: 'Office Interiors',
    location: 'Creative Quarter',
    year: '2024',
    description:
      'A twelve-desk studio for an architecture practice. Acoustic felt ceilings, oak worktables and a library wall give the space the quiet of a reading room with the energy of a workshop.',
    image1: img('photo-1497366811353-6870744d04b2', 1100),
    image2: img('photo-1524758631624-e2822e304c36', 1100),
    image3: img('photo-1497366216548-37526070297c', 1400),
  },
  {
    title: 'Senna Boutique Hotel',
    category: 'Commercial Spaces',
    location: 'Old Town',
    year: '2023',
    description:
      'Twelve guest rooms and a lobby bar in a restored townhouse. A restrained palette of clay, linen and aged brass runs throughout, durable enough for hospitality and warm enough to stay in.',
    image1: img('photo-1616137466211-f939a420be84', 1100),
    image2: img('photo-1631049307264-da0ec9d70304', 1100),
    image3: img('photo-1522708323590-d24dbb6b0267', 1400),
  },
];

const DEFAULT_GALLERY = [
  { title: 'Ivy Residence — Living Room', category: 'Living Rooms', image: img('photo-1616486338812-3dadae4b4ace', 1200) },
  { title: 'Aurelia — Reading Corner', category: 'Living Rooms', image: img('photo-1618221195710-dd6b41faaea6', 1000) },
  { title: 'Oak & Linen Lounge', category: 'Living Rooms', image: img('photo-1600210492486-724fe5c67fb0', 1200) },
  { title: 'Senna — Primary Suite', category: 'Bedrooms', image: img('photo-1616594039964-ae9021a400a0', 1200) },
  { title: 'Quiet Bedroom, Warm Ivory', category: 'Bedrooms', image: img('photo-1631049307264-da0ec9d70304', 1200) },
  { title: 'Maison Kave — Island', category: 'Kitchens', image: img('photo-1556909212-d5b604d0c90d', 1200) },
  { title: 'Fluted Detail Kitchen', category: 'Kitchens', image: img('photo-1556911220-bff31c812dba', 1200) },
  { title: 'Marble & Brass Kitchen', category: 'Kitchens', image: img('photo-1584622650111-993a426fbf0a', 1200) },
  { title: 'Hillside House — Facade', category: 'Modern Homes', image: img('photo-1600585154340-be6161a56a0c', 1200) },
  { title: 'Double Height Stair Hall', category: 'Modern Homes', image: img('photo-1600607687939-ce8a6c25118c', 1200) },
  { title: 'Northlight — Library Wall', category: 'Offices', image: img('photo-1497366811353-6870744d04b2', 1200) },
  { title: 'Studio Meeting Table', category: 'Offices', image: img('photo-1497366216548-37526070297c', 1200) },
  { title: 'Senna Lobby Bar', category: 'Luxury Interiors', image: img('photo-1616137466211-f939a420be84', 1200) },
  { title: 'Plaster & Travertine', category: 'Luxury Interiors', image: img('photo-1600607687920-4e2a09cf159d', 1200) },
  { title: 'Evening Lounge', category: 'Luxury Interiors', image: img('photo-1600121848594-d8644e57abab', 1200) },
  { title: 'Open Plan Living', category: 'Modern Homes', image: img('photo-1600566753086-00f18fb6b3ea', 1200) },
];

const DEFAULT_PRICING = [
  {
    name: 'Essential Design',
    price_label: 'Add price in admin',
    price_note: 'Per room · editable placeholder',
    description: 'A focused design package for one room that needs clarity, layout and a finished palette.',
    features: [
      'One room, up to 350 sq ft',
      'Measured plan & furniture layout',
      'Material, finish & paint palette',
      'Lighting and styling direction',
      'Two revision rounds',
    ],
    highlight: 0,
  },
  {
    name: 'Premium Design',
    price_label: 'Add price in admin',
    price_note: 'Per home · editable placeholder',
    description: 'Our most requested engagement — full design for a primary living zone with detailed joinery.',
    features: [
      'Up to three connected spaces',
      'Joinery and millwork drawings',
      'Custom furniture specification',
      '3D visualization of key views',
      'Site visits with your contractor',
      'Four revision rounds',
    ],
    highlight: 1,
  },
  {
    name: 'Luxury Design',
    price_label: 'Add price in admin',
    price_note: 'Turnkey residence · editable placeholder',
    description: 'A complete turnkey residence: design, procurement and installation handled by the studio.',
    features: [
      'Whole-home design scope',
      'Bespoke furniture & art curation',
      'Full 3D walkthrough package',
      'Procurement and vendor management',
      'On-site supervision to handover',
      'Styled photography on completion',
    ],
    highlight: 0,
  },
];

export function ensureSeed() {
  const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  if (adminCount === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@kave.studio').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'KaveStudio2026!';
    db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(
      email,
      bcrypt.hashSync(password, 12),
    );
  }

  const contentCount = db.prepare('SELECT COUNT(*) AS c FROM content').get().c;
  if (contentCount === 0) {
    const insert = db.prepare('INSERT INTO content (key, value) VALUES (?, ?)');
    const tx = db.transaction(() => {
      for (const [key, value] of Object.entries(DEFAULT_CONTENT)) insert.run(key, value);
    });
    tx();
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM services').get().c === 0) {
    const insert = db.prepare(
      'INSERT INTO services (title, description, image, bullet, sort) VALUES (@title, @description, @image, @bullet, @sort)',
    );
    db.transaction(() => {
      DEFAULT_SERVICES.forEach((s, i) => insert.run({ ...s, sort: i }));
    })();
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM projects').get().c === 0) {
    const insert = db.prepare(
      'INSERT INTO projects (title, category, location, year, description, image1, image2, image3, sort) VALUES (@title, @category, @location, @year, @description, @image1, @image2, @image3, @sort)',
    );
    db.transaction(() => {
      DEFAULT_PROJECTS.forEach((p, i) => insert.run({ ...p, sort: i }));
    })();
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM gallery').get().c === 0) {
    const insert = db.prepare(
      'INSERT INTO gallery (title, category, image, sort) VALUES (@title, @category, @image, @sort)',
    );
    db.transaction(() => {
      DEFAULT_GALLERY.forEach((g, i) => insert.run({ ...g, sort: i }));
    })();
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM pricing').get().c === 0) {
    const insert = db.prepare(
      'INSERT INTO pricing (name, price_label, price_note, description, features, highlight, sort) VALUES (@name, @price_label, @price_note, @description, @features, @highlight, @sort)',
    );
    db.transaction(() => {
      DEFAULT_PRICING.forEach((p, i) =>
        insert.run({ ...p, features: JSON.stringify(p.features), sort: i }),
      );
    })();
  }
}

ensureSeed();
