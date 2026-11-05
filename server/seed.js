import fs from 'node:fs';
import path from 'node:path';

const force = process.argv.includes('--force');
if (force) {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'server', 'data');
  for (const name of ['kave.db', 'kave.db-wal', 'kave.db-shm']) {
    const p = path.join(dataDir, name);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  console.log('Removed existing database.');
}

const { db, ensureSeed, DATA_DIR } = await import('./db.js');
ensureSeed();
const count = (t) => db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
console.log(`Seeded ${DATA_DIR}`);
console.log({
  admins: count('admins'),
  services: count('services'),
  projects: count('projects'),
  gallery: count('gallery'),
  pricing: count('pricing'),
});
