import { pool } from '../config/database.js';

export class CategoryService {
  static async getAllActive() {
    const [rows] = await pool.query(
      `SELECT category_id, name, slug, description
       FROM categories
       ORDER BY name ASC`
    );
    return rows;
  }
}
