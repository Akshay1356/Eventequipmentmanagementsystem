import mysql from 'mysql2/promise';
import { ENV } from './env.js';

const poolConfig = ENV.DATABASE_URL
  ? {
      uri: ENV.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: ENV.DB.CONNECTION_LIMIT,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      decimalNumbers: true,
      dateStrings: true,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    }
  : {
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      database: ENV.DB.NAME,
      waitForConnections: true,
      connectionLimit: ENV.DB.CONNECTION_LIMIT,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      decimalNumbers: true,
      dateStrings: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };

export const pool = mysql.createPool(poolConfig);

/**
 * Pings database to check connection health.
 * Returns { connected: boolean, error?: string, database: string }
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return {
      connected: true,
      database: ENV.DB.NAME,
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
    };
  } catch (error) {
    return {
      connected: false,
      database: ENV.DB.NAME,
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Executes a callback inside a database transaction.
 * Automatically commits on success and rolls back on exception.
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
