import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.util.js';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@eventhub.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const fullName = process.env.ADMIN_NAME || 'System Administrator';

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE users 
         SET full_name = ?, password_hash = ?, role = 'ADMIN', account_status = 'ACTIVE'
         WHERE email = ?`,
        [fullName, passwordHash, email]
      );
      logger.info(`Existing user "${email}" updated to ADMIN with specified password.`);
    } else {
      const userId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO users (user_id, full_name, email, password_hash, role, account_status)
         VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
        [userId, fullName, email, passwordHash]
      );
      logger.info(`Admin user created:`);
      logger.info(`  Email:    ${email}`);
      logger.info(`  Password: ${password}`);
      logger.info(`  Role:     ADMIN`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Failed to provision admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
