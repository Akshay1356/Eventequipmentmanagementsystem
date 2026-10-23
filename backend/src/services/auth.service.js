import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool } from '../config/database.js';
import { ENV } from '../config/env.js';

export class AuthService {
  static async register({ fullName, email, password, phone, company, role = 'CUSTOMER' }) {
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing.length > 0) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (user_id, full_name, email, password_hash, phone, company, role, account_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [userId, fullName.trim(), cleanEmail, passwordHash, phone || null, company || null, role]
    );

    const token = jwt.sign(
      {
        userId,
        email: cleanEmail,
        role,
        fullName: fullName.trim(),
      },
      ENV.JWT.SECRET,
      { expiresIn: ENV.JWT.EXPIRES_IN }
    );

    return {
      user: {
        userId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone || null,
        company: company || null,
        role,
      },
      token,
    };
  }

  static async login({ email, password }) {
    const cleanEmail = (email || '').toLowerCase().trim();

    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, phone, company, role, account_status FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (rows.length === 0) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const user = rows[0];

    if (user.account_status !== 'ACTIVE') {
      const err = new Error(`Account is currently ${user.account_status.toLowerCase()}. Please contact support.`);
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      ENV.JWT.SECRET,
      { expiresIn: ENV.JWT.EXPIRES_IN }
    );

    return {
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
      },
      token,
    };
  }

  static async getProfile(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, phone, company, role, account_status, created_at FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const user = rows[0];
    return {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      status: user.account_status,
      createdAt: user.created_at,
    };
  }
}
