import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || process.env.MYSQL_URL || null,
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'event_equipment_db',
    CONNECTION_LIMIT: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    SSL: process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL),
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'event_equipment_super_secret_jwt_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
};
