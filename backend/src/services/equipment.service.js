import { pool } from '../config/database.js';

export class EquipmentService {
  /**
   * Retrieves a paginated or filtered list of equipment.
   * If startDate & endDate are provided, calculates real-time available stock
   * using booked quantities.
   */
  static async getAll({
    category,
    search,
    condition,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  }) {
    let baseSql = `
      SELECT 
        e.equipment_id,
        e.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        e.sku,
        e.equipment_name AS name,
        e.brand,
        e.model,
        e.short_desc,
        e.description,
        e.daily_rate,
        e.replacement_value,
        e.total_quantity,
        e.condition_status,
        e.listing_status AS status,
        e.image_url,
        e.images,
        e.specifications,
        e.featured,
        e.rating,
        e.created_at
    `;

    const params = [];
    const whereClauses = ["e.listing_status != 'DISCONTINUED'"];

    if (category && category !== 'all') {
      whereClauses.push('(e.category_id = ? OR c.slug = ? OR c.name = ?)');
      params.push(category, category, category);
    }

    if (condition) {
      whereClauses.push('e.condition_status = ?');
      params.push(condition);
    }

    if (status && status !== 'all') {
      whereClauses.push('e.listing_status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(e.equipment_name LIKE ? OR e.description LIKE ? OR e.brand LIKE ? OR e.model LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    let availabilitySubquery = '';
    const dateParams = [];

    if (startDate && endDate) {
      availabilitySubquery = `
        , GREATEST(0, e.total_quantity - 
          COALESCE((
            SELECT SUM(bi.quantity)
            FROM booking_items bi
            JOIN bookings b ON bi.booking_id = b.booking_id
            WHERE bi.equipment_id = e.equipment_id
              AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
              AND b.rental_start < ?
              AND b.rental_end > ?
          ), 0)
        ) AS available_quantity
      `;
      dateParams.push(endDate, startDate);
    } else {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      availabilitySubquery = `
        , GREATEST(0, e.total_quantity - 
          COALESCE((
            SELECT SUM(bi.quantity)
            FROM booking_items bi
            JOIN bookings b ON bi.booking_id = b.booking_id
            WHERE bi.equipment_id = e.equipment_id
              AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
              AND b.rental_start <= '${now}'
              AND b.rental_end >= '${now}'
          ), 0)
        ) AS available_quantity
      `;
    }

    const query = `
      ${baseSql}
      ${availabilitySubquery}
      FROM equipment e
      JOIN categories c ON e.category_id = c.category_id
      ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
      ORDER BY e.featured DESC, e.equipment_id ASC
      LIMIT ? OFFSET ?
    `;

    const allParams = [...dateParams, ...params, Number(limit), Number(offset)];
    const [rows] = await pool.query(query, allParams);

    return rows.map((item) => ({
      ...item,
      id: item.equipment_id,
      specifications: typeof item.specifications === 'string'
        ? JSON.parse(item.specifications || '{}')
        : (item.specifications || {}),
      images: typeof item.images === 'string'
        ? JSON.parse(item.images || '[]')
        : (item.images || (item.image_url ? [item.image_url] : [])),
      daily_rate: Number(item.daily_rate),
      dailyRate: Number(item.daily_rate),
      shortDesc: item.short_desc,
      imageUrl: item.image_url,
      category: item.category_slug || item.category_id,
      categoryLabel: item.category_name,
      replacement_value: Number(item.replacement_value || 0),
      total_quantity: Number(item.total_quantity),
      stock: Number(item.total_quantity),
      available_quantity: item.available_quantity !== undefined ? Number(item.available_quantity) : item.total_quantity,
      availableQuantity: item.available_quantity !== undefined ? Number(item.available_quantity) : item.total_quantity,
      featured: Boolean(item.featured),
      rating: Number(item.rating || 5.0),
    }));
  }

  static async getById(equipmentId, { startDate, endDate } = {}) {
    let availabilitySubquery = '';
    const dateParams = [];

    if (startDate && endDate) {
      availabilitySubquery = `
        , GREATEST(0, e.total_quantity - 
          COALESCE((
            SELECT SUM(bi.quantity)
            FROM booking_items bi
            JOIN bookings b ON bi.booking_id = b.booking_id
            WHERE bi.equipment_id = e.equipment_id
              AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
              AND b.rental_start < ?
              AND b.rental_end > ?
          ), 0)
        ) AS available_quantity
      `;
      dateParams.push(endDate, startDate);
    } else {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      availabilitySubquery = `
        , GREATEST(0, e.total_quantity - 
          COALESCE((
            SELECT SUM(bi.quantity)
            FROM booking_items bi
            JOIN bookings b ON bi.booking_id = b.booking_id
            WHERE bi.equipment_id = e.equipment_id
              AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
              AND b.rental_start <= '${now}'
              AND b.rental_end >= '${now}'
          ), 0)
        ) AS available_quantity
      `;
    }

    const query = `
      SELECT 
        e.equipment_id,
        e.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        e.sku,
        e.equipment_name AS name,
        e.brand,
        e.model,
        e.short_desc,
        e.description,
        e.daily_rate,
        e.replacement_value,
        e.total_quantity,
        e.condition_status,
        e.listing_status AS status,
        e.image_url,
        e.images,
        e.specifications,
        e.featured,
        e.rating,
        e.created_at
        ${availabilitySubquery}
      FROM equipment e
      JOIN categories c ON e.category_id = c.category_id
      WHERE e.equipment_id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [...dateParams, equipmentId]);

    if (rows.length === 0) {
      const err = new Error(`Equipment with ID ${equipmentId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const item = rows[0];
    return {
      ...item,
      id: item.equipment_id,
      specifications: typeof item.specifications === 'string'
        ? JSON.parse(item.specifications || '{}')
        : (item.specifications || {}),
      images: typeof item.images === 'string'
        ? JSON.parse(item.images || '[]')
        : (item.images || (item.image_url ? [item.image_url] : [])),
      daily_rate: Number(item.daily_rate),
      dailyRate: Number(item.daily_rate),
      shortDesc: item.short_desc,
      imageUrl: item.image_url,
      category: item.category_slug || item.category_id,
      categoryLabel: item.category_name,
      replacement_value: Number(item.replacement_value || 0),
      total_quantity: Number(item.total_quantity),
      stock: Number(item.total_quantity),
      available_quantity: item.available_quantity !== undefined ? Number(item.available_quantity) : item.total_quantity,
      availableQuantity: item.available_quantity !== undefined ? Number(item.available_quantity) : item.total_quantity,
      featured: Boolean(item.featured),
      rating: Number(item.rating || 5.0),
    };
  }
}
