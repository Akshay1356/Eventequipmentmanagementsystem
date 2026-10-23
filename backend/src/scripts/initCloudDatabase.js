import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { pool, testConnection } from '../config/database.js';
import { logger } from '../utils/logger.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initCloudDatabase() {
  logger.info('Connecting to database...');
  const health = await testConnection();

  if (!health.connected) {
    logger.error(`Database connection failed: ${health.error}`);
    logger.error('Please verify your DATABASE_URL or DB_HOST / DB_USER / DB_PASSWORD credentials.');
    process.exit(1);
  }

  logger.info(`Successfully connected to database: ${health.database || 'remote instance'}`);

  // 1. Read and execute schema.sql
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Strip line comments (-- ...) and block comments (/* ... */)
  const noCommentsSql = schemaSql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('--');
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join('\n');

  // Remove CREATE DATABASE and USE statements
  const cleanedSql = noCommentsSql
    .replace(/CREATE DATABASE[\s\S]*?;/gi, '')
    .replace(/USE\s+[`\w]+;/gi, '');

  // Split into individual SQL statements
  const statements = cleanedSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  logger.info(`Applying ${statements.length} schema statements...`);

  const connection = await pool.getConnection();
  try {
    for (const stmt of statements) {
      if (stmt.toLowerCase().startsWith('select ') || stmt.toLowerCase().startsWith('show ')) continue;
      try {
        await connection.query(stmt);
      } catch (err) {
        // Ignore "table already exists" or non-fatal warnings
        if (!err.message.includes('already exists')) {
          logger.warn(`Statement notice: ${err.message}`);
        }
      }
    }
    logger.info('Schema tables verified and created successfully.');
  } finally {
    connection.release();
  }

  // 2. Ensure default admin and customer exist
  const salt = await bcrypt.genSalt(10);

  // Admin user
  const adminHash = await bcrypt.hash('admin123', salt);
  const [existingAdmin] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['admin@aura.com']);
  if (existingAdmin.length === 0) {
    await pool.query(
      `INSERT INTO users (user_id, full_name, email, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
      [crypto.randomUUID(), 'Aura Administrator', 'admin@aura.com', adminHash]
    );
    logger.info('Admin provisioned: admin@aura.com / admin123');
  } else {
    await pool.query(
      `UPDATE users SET password_hash = ?, role = 'ADMIN', account_status = 'ACTIVE' WHERE email = ?`,
      [adminHash, 'admin@aura.com']
    );
    logger.info('Admin credentials refreshed: admin@aura.com / admin123');
  }

  // Demo customer user
  const userHash = await bcrypt.hash('user123', salt);
  const [existingCustomer] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['user@aura.com']);
  if (existingCustomer.length === 0) {
    await pool.query(
      `INSERT INTO users (user_id, full_name, email, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
      [crypto.randomUUID(), 'Demo Customer', 'user@aura.com', userHash]
    );
    logger.info('Customer provisioned: user@aura.com / user123');
  } else {
    await pool.query(
      `UPDATE users SET password_hash = ?, role = 'CUSTOMER', account_status = 'ACTIVE' WHERE email = ?`,
      [userHash, 'user@aura.com']
    );
    logger.info('Customer credentials refreshed: user@aura.com / user123');
  }

  // 3. Seed equipment catalogue
  const [equipmentCount] = await pool.query('SELECT COUNT(*) as cnt FROM equipment');
  if (equipmentCount[0].cnt === 0) {
    logger.info('Equipment table is empty. Running catalogue seed...');
    const { seed } = await import('./seedEquipmentCatalogue.js');
    await seed();
  } else {
    logger.info(`Equipment catalog already contains ${equipmentCount[0].cnt} items.`);
  }

  logger.info('Cloud database initialization complete! All tables and seed accounts are ready.');
  process.exit(0);
}

initCloudDatabase().catch((err) => {
  logger.error('Database initialization encountered fatal error:', err);
  process.exit(1);
});
