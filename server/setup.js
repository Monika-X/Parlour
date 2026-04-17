/**
 * setup.js – Interactive Parlour database setup script
 * Run: node setup.js
 * This creates the database, all tables, and seeds sample data.
 */

require('dotenv').config();
const mysql  = require('mysql2/promise');
const fs     = require('fs');
const path   = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const colors = {
  gold:  '\x1b[33m',
  green: '\x1b[32m',
  red:   '\x1b[31m',
  cyan:  '\x1b[36m',
  gray:  '\x1b[90m',
  bold:  '\x1b[1m',
  reset: '\x1b[0m',
};
const c = (col, str) => `${colors[col]}${str}${colors.reset}`;

async function main() {
  console.log('\n' + c('gold', '═'.repeat(55)));
  console.log(c('bold', c('gold', '  Parlour Salon & Spa – Database Setup Wizard')));
  console.log(c('gold', '═'.repeat(55)) + '\n');

  // ── Collect credentials ──────────────────────────────────
  const host     = (await ask(c('cyan', `  MySQL Host     [${process.env.DB_HOST || 'localhost'}]: `))) || process.env.DB_HOST || 'localhost';
  const port     = (await ask(c('cyan', `  MySQL Port     [${process.env.DB_PORT || '3306'}]: `)))     || process.env.DB_PORT || '3306';
  const user     = (await ask(c('cyan', `  MySQL User     [${process.env.DB_USER || 'root'}]: `)))     || process.env.DB_USER || 'root';
  const password =  await ask(c('cyan', `  MySQL Password : `));
  const database = (await ask(c('cyan', `  Database Name  [${process.env.DB_NAME || 'parlour_db'}]: `))) || process.env.DB_NAME || 'parlour_db';

  console.log('\n' + c('gray', '  Connecting to MySQL…'));

  let conn;
  try {
    conn = await mysql.createConnection({ host, port: Number(port), user, password });
    console.log(c('green', '  Connected to MySQL successfully!'));
  } catch (err) {
    console.error(c('red', '\n  Connection failed: ' + err.message));
    console.log(c('gray', '  ➜  Check your credentials and try again.\n'));
    rl.close(); process.exit(1);
  }

  // ── Create database ──────────────────────────────────────
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${database}\``);
    console.log(c('green', `  Database '${database}' ready.`));
  } catch (err) {
    console.error(c('red', '  Failed to create database: ' + err.message));
    rl.close(); conn.end(); process.exit(1);
  }

  // ── Run SQL schema ───────────────────────────────────────
  const sqlPath = path.join(__dirname, 'config', 'database.sql');
  const raw     = fs.readFileSync(sqlPath, 'utf8');

  // Split out individual statements (skip CREATE DATABASE / USE lines – already handled)
  const statements = raw
    .split(';')
    .map(s => s.replace(/--[^\n]*/g, '').trim())
    .filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE '));

  console.log(c('gray', `\n  Running ${statements.length} SQL statements…`));
  let ok = 0, skip = 0;

  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      ok++;
    } catch (err) {
      // 1062 = Duplicate entry (seed already exists) — fine
      if (err.errno === 1062) { skip++; }
      else { console.warn(c('gray', `    ⚠  ${err.message.slice(0,80)}`)); skip++; }
    }
  }
  console.log(c('green', `  Schema applied: ${ok} ok, ${skip} skipped.`));

  // ── Update .env ──────────────────────────────────────────
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  const update = (content, key, value) => {
    const re = new RegExp(`^${key}=.*`, 'm');
    return re.test(content) ? content.replace(re, `${key}=${value}`) : content + `\n${key}=${value}`;
  };

  envContent = update(envContent, 'DB_HOST',     host);
  envContent = update(envContent, 'DB_PORT',     port);
  envContent = update(envContent, 'DB_USER',     user);
  envContent = update(envContent, 'DB_PASSWORD', password);
  envContent = update(envContent, 'DB_NAME',     database);

  fs.writeFileSync(envPath, envContent);
  console.log(c('green', '  server/.env updated with your credentials.'));

  // ── Done ─────────────────────────────────────────────────
  await conn.end();
  rl.close();

  console.log('\n' + c('gold', '═'.repeat(55)));
  console.log(c('bold', c('green', '  Setup complete! Next steps:')));
  console.log(c('gold', '═'.repeat(55)));
  console.log(c('cyan', '\n  1. Start the server:'));
  console.log(c('gray', '       cd server && npm run dev\n'));
  console.log(c('cyan', '  2. Open the site:'));
  console.log(c('gray', '       http://localhost:5000\n'));
  console.log(c('cyan', '  3. Admin login:'));
  console.log(c('gray', '       Email:    admin@parlour.com'));
  console.log(c('gray', '       Password: Admin@123\n'));
  console.log(c('gold', '  Enjoy Parlour!\n'));
}

main().catch(err => { console.error(err); process.exit(1); });
