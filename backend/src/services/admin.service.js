import { pool } from '../config/database.js';

export class AdminService {
  /**
   * Retrieves full equipment inventory for admin management.
   */
  static async getInventory() {
    const [rows] = await pool.query(
      `SELECT 
        e.equipment_id,
        e.equipment_id AS id,
        e.sku,
        e.equipment_name AS name,
        e.brand,
        e.model,
        e.short_desc,
        e.daily_rate,
        e.total_quantity,
        e.total_quantity AS stock,
        e.condition_status,
        e.listing_status AS status,
        e.image_url,
        e.specifications,
        c.category_id,
        c.name AS category_name,
        COALESCE((
          SELECT SUM(bi.quantity)
          FROM booking_items bi
          JOIN bookings b ON bi.booking_id = b.booking_id
          WHERE bi.equipment_id = e.equipment_id
            AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
            AND b.rental_end >= CURRENT_DATE
        ), 0) AS reserved_count
       FROM equipment e
       JOIN categories c ON e.category_id = c.category_id
       ORDER BY e.created_at DESC`
    );

    return rows.map((item) => {
      const reserved = Number(item.reserved_count);
      const stock = Number(item.total_quantity);
      const available = Math.max(0, stock - reserved);

      return {
        ...item,
        daily_rate: Number(item.daily_rate),
        stock,
        reserved_count: reserved,
        availableQuantity: available,
        available_quantity: available,
        specifications: typeof item.specifications === 'string'
          ? JSON.parse(item.specifications || '{}')
          : (item.specifications || {}),
      };
    });
  }

  /**
   * Adds new equipment to inventory.
   */
  static async createEquipment(data) {
    const {
      categoryId,
      sku,
      name,
      brand,
      model,
      shortDesc,
      description,
      dailyRate,
      replacementValue = 0,
      totalQuantity = 1,
      conditionStatus = 'EXCELLENT',
      imageUrl,
      specifications,
    } = data;

    const equipmentId = `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.query(
      `INSERT INTO equipment (
        equipment_id, category_id, sku, equipment_name, brand, model,
        short_desc, description, daily_rate, replacement_value, total_quantity,
        condition_status, listing_status, image_url, images, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)`,
      [
        equipmentId,
        categoryId,
        sku,
        name,
        brand || 'AURA Standard',
        model || 'Model Pro',
        shortDesc || name,
        description || null,
        dailyRate,
        replacementValue,
        totalQuantity,
        conditionStatus,
        imageUrl || null,
        imageUrl ? JSON.stringify([imageUrl]) : null,
        specifications ? JSON.stringify(specifications) : null,
      ]
    );

    return {
      equipmentId,
      id: equipmentId,
      ...data,
      status: 'ACTIVE',
    };
  }

  /**
   * Updates existing equipment item.
   */
  static async updateEquipment(equipmentId, updates) {
    const allowedFields = {
      name: 'equipment_name',
      equipment_name: 'equipment_name',
      brand: 'brand',
      model: 'model',
      description: 'description',
      shortDesc: 'short_desc',
      short_desc: 'short_desc',
      dailyRate: 'daily_rate',
      daily_rate: 'daily_rate',
      totalQuantity: 'total_quantity',
      total_quantity: 'total_quantity',
      stock: 'total_quantity',
      conditionStatus: 'condition_status',
      condition_status: 'condition_status',
      status: 'listing_status',
      listing_status: 'listing_status',
      imageUrl: 'image_url',
      image_url: 'image_url',
      categoryId: 'category_id',
      category_id: 'category_id',
      specifications: 'specifications',
    };

    const setClauses = [];
    const values = [];

    for (const [key, val] of Object.entries(updates)) {
      const col = allowedFields[key];
      if (col) {
        setClauses.push(`${col} = ?`);
        values.push(col === 'specifications' && typeof val === 'object' ? JSON.stringify(val) : val);
      }
    }

    if (setClauses.length === 0) {
      const err = new Error('No valid fields provided for update');
      err.statusCode = 400;
      throw err;
    }

    values.push(equipmentId);

    const [result] = await pool.query(
      `UPDATE equipment SET ${setClauses.join(', ')} WHERE equipment_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      const err = new Error(`Equipment ${equipmentId} not found`);
      err.statusCode = 404;
      throw err;
    }

    return { equipmentId, message: 'Equipment updated successfully' };
  }

  /**
   * Retrieves all bookings with customer details for administrative oversight.
   */
  static async getAllBookings({ status, limit = 100, offset = 0 } = {}) {
    const whereClauses = [];
    const params = [];

    if (status && status !== 'all') {
      whereClauses.push('(b.booking_status = ? OR LOWER(b.booking_status) = ?)');
      params.push(status.toUpperCase(), status.toLowerCase());
    }

    const query = `
      SELECT 
        b.booking_id,
        b.booking_code AS id,
        b.booking_id AS bookingId,
        b.booking_code AS bookingCode,
        b.booking_code AS bookingReference,
        b.customer_id,
        COALESCE(b.client_name, u.full_name) AS clientName,
        COALESCE(b.client_email, u.email) AS clientEmail,
        COALESCE(b.client_phone, u.phone) AS clientPhone,
        COALESCE(b.client_company, u.company, 'Direct Client') AS company,
        COALESCE(b.customer_notes, CONCAT(COALESCE(b.client_name, u.full_name), '''s Event Production')) AS eventName,
        COALESCE(b.delivery_address, 'Venue Stage Delivery') AS venueName,
        b.delivery_address AS deliveryAddress,
        DATE_FORMAT(b.rental_start, '%Y-%m-%d') AS startDate,
        DATE_FORMAT(b.rental_end, '%Y-%m-%d') AS endDate,
        b.duration_days AS durationDays,
        b.duration_days AS totalDays,
        b.equipment_subtotal AS subtotalAmount,
        b.tax_amount AS taxAmount,
        b.total_amount AS totalAmount,
        LOWER(b.booking_status) AS status,
        b.booking_status AS rawStatus,
        b.needs_technician AS requiresTechnician,
        b.created_at,
        p.payment_status,
        p.payment_method
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));
    const [bookings] = await pool.query(query, params);

    return bookings.map((b) => ({
      ...b,
      subtotalAmount: Number(b.subtotalAmount),
      taxAmount: Number(b.taxAmount),
      totalAmount: Number(b.totalAmount),
    }));
  }

  /**
   * Updates booking status (e.g. CONFIRMED -> OUT_FOR_DELIVERY -> COMPLETED).
   */
  static async updateBookingStatus(bookingId, status) {
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY',
      'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED'
    ];

    const upperStatus = (status || '').toUpperCase();

    if (!validStatuses.includes(upperStatus)) {
      const err = new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const [result] = await pool.query(
      'UPDATE bookings SET booking_status = ? WHERE booking_id = ? OR booking_code = ?',
      [upperStatus, bookingId, bookingId]
    );

    if (result.affectedRows === 0) {
      const err = new Error(`Booking ${bookingId} not found`);
      err.statusCode = 404;
      throw err;
    }

    return { bookingId, status: upperStatus, message: `Booking status updated to ${upperStatus}` };
  }
}
