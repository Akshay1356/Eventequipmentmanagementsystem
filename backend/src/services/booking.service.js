import crypto from 'node:crypto';
import { pool, withTransaction } from '../config/database.js';

export class BookingService {
  /**
   * Generates a unique, collision-resistant booking reference code.
   * Example: BK-20261021-9A3F
   */
  static generateReference() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${dateStr}-${rand}`;
  }

  /**
   * Calculates rental days between two dates.
   * Minimum 1 day.
   */
  static calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) {
      throw new Error('End date must be strictly after start date');
    }
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }

  static toSqlDate(iso) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Creates a new booking with row-level locking (FOR UPDATE)
   * and server-side pricing verification.
   */
  static async createBooking({
    userId,
    items, // [{ equipmentId, quantity }]
    startDate,
    endDate,
    requiresDelivery = false,
    requiresTechnician = false,
    deliveryAddress = 'Standard Pickup / On-site',
    notes = null,
    paymentMethod = 'UPI',
    clientName,
    clientEmail,
    clientPhone,
    clientCompany,
  }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Booking must contain at least one equipment item');
      err.statusCode = 400;
      throw err;
    }

    const durationDays = this.calculateDays(startDate, endDate);
    const bookingCode = this.generateReference();
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sqlStartDate = this.toSqlDate(startDate);
    const sqlEndDate = this.toSqlDate(endDate);

    // Get user details if client fields omitted
    let cName = clientName;
    let cEmail = clientEmail;
    let cPhone = clientPhone || 'N/A';
    let cCompany = clientCompany || null;

    if (!cName || !cEmail) {
      const [uRows] = await pool.query('SELECT full_name, email, phone, company FROM users WHERE user_id = ?', [userId]);
      if (uRows.length > 0) {
        cName = cName || uRows[0].full_name;
        cEmail = cEmail || uRows[0].email;
        cPhone = (cPhone !== 'N/A' && cPhone) || uRows[0].phone || 'N/A';
        cCompany = cCompany || uRows[0].company;
      } else {
        cName = cName || 'Customer';
        cEmail = cEmail || 'customer@example.com';
      }
    }

    return await withTransaction(async (conn) => {
      let subtotalAmount = 0;
      const verifiedItems = [];

      // Sort items by equipmentId to prevent deadlocks
      const sortedItems = [...items].sort((a, b) => String(a.equipmentId).localeCompare(String(b.equipmentId)));

      for (const item of sortedItems) {
        const eqId = String(item.equipmentId);
        const reqQty = Number(item.quantity) || 1;

        if (reqQty <= 0) {
          const err = new Error(`Invalid quantity ${reqQty} for equipment ID ${eqId}`);
          err.statusCode = 400;
          throw err;
        }

        // Lock equipment row
        const [eqRows] = await conn.query(
          `SELECT equipment_id, equipment_name, daily_rate, total_quantity, listing_status
           FROM equipment
           WHERE equipment_id = ?
           FOR UPDATE`,
          [eqId]
        );

        if (eqRows.length === 0) {
          const err = new Error(`Equipment with ID ${eqId} does not exist`);
          err.statusCode = 404;
          throw err;
        }

        const equipment = eqRows[0];

        if (equipment.listing_status === 'DISCONTINUED') {
          const err = new Error(`Equipment "${equipment.equipment_name}" is no longer available for rent`);
          err.statusCode = 400;
          throw err;
        }

        // Check booked quantity in the requested interval
        const [bookingConflicts] = await conn.query(
          `SELECT COALESCE(SUM(bi.quantity), 0) AS reserved_qty
           FROM booking_items bi
           JOIN bookings b ON bi.booking_id = b.booking_id
           WHERE bi.equipment_id = ?
             AND b.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')
             AND b.rental_start < ?
             AND b.rental_end > ?`,
          [eqId, sqlEndDate, sqlStartDate]
        );

        const reservedQty = Number(bookingConflicts[0].reserved_qty || 0);
        const availableQty = Math.max(0, equipment.total_quantity - reservedQty);

        if (reqQty > availableQty) {
          const err = new Error(
            `Insufficient inventory for "${equipment.equipment_name}". Requested: ${reqQty}, Available for chosen dates: ${availableQty}.`
          );
          err.statusCode = 409;
          throw err;
        }

        const dailyRate = Number(equipment.daily_rate);
        const lineTotal = dailyRate * reqQty * durationDays;

        subtotalAmount += lineTotal;

        verifiedItems.push({
          itemId: crypto.randomUUID(),
          equipmentId: eqId,
          name: equipment.equipment_name,
          quantity: reqQty,
          unitPrice: dailyRate,
          lineTotal,
        });
      }

      // Calculate authoritative fees & taxes
      const technicianFee = requiresTechnician ? 2500 * durationDays : 0;
      const deliveryFee = requiresDelivery ? 1500 : 0;
      const taxableAmount = subtotalAmount + technicianFee + deliveryFee;
      const taxAmount = Number((taxableAmount * 0.18).toFixed(2)); // 18% GST
      const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

      // 1. Insert booking
      await conn.query(
        `INSERT INTO bookings (
          booking_id, booking_code, customer_id, rental_start, rental_end,
          duration_days, delivery_address, needs_technician, technician_fee,
          equipment_subtotal, delivery_fee, tax_amount, total_amount,
          booking_status, client_name, client_email, client_phone, client_company,
          customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
        [
          bookingId,
          bookingCode,
          userId,
          sqlStartDate,
          sqlEndDate,
          durationDays,
          deliveryAddress || 'Standard Delivery',
          Boolean(requiresTechnician),
          technicianFee,
          subtotalAmount,
          deliveryFee,
          taxAmount,
          totalAmount,
          cName,
          cEmail,
          cPhone,
          cCompany,
          notes || null,
        ]
      );

      // 2. Insert booking items
      for (const item of verifiedItems) {
        await conn.query(
          `INSERT INTO booking_items (
            booking_item_id, booking_id, equipment_id, quantity,
            daily_rate_at_booking, rental_days, line_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.itemId,
            bookingId,
            item.equipmentId,
            item.quantity,
            item.unitPrice,
            durationDays,
            item.lineTotal,
          ]
        );
      }

      // 3. Insert initial payment record
      const paymentId = crypto.randomUUID();
      const paymentRef = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await conn.query(
        `INSERT INTO payments (
          payment_id, booking_id, amount, currency, payment_method,
          payment_status, provider_transaction_id, paid_at
        ) VALUES (?, ?, ?, 'INR', ?, 'SUCCESS', ?, NOW())`,
        [paymentId, bookingId, totalAmount, paymentMethod, paymentRef]
      );

      return {
        bookingId,
        id: bookingId,
        bookingCode,
        bookingReference: bookingCode,
        userId,
        eventName: cName ? `${cName}'s Event` : 'Event Production',
        venueName: deliveryAddress || 'Standard Venue Delivery',
        startDate,
        endDate,
        durationDays,
        totalDays: durationDays,
        totalAmount,
        equipmentSubtotal: subtotalAmount,
        subtotalAmount,
        technicianFee,
        deliveryFee,
        taxAmount,
        pricing: {
          subtotalAmount,
          technicianFee,
          deliveryFee,
          taxAmount,
          totalAmount,
        },
        status: 'PENDING',
        rawStatus: 'PENDING',
        items: verifiedItems,
        payment: {
          paymentId,
          transactionReference: paymentRef,
          amount: totalAmount,
          method: paymentMethod,
          status: 'SUCCESS',
        },
      };
    });
  }

  /**
   * Retrieves all bookings for a specific customer.
   */
  static async getUserBookings(userId) {
    const [bookings] = await pool.query(
      `SELECT 
        b.booking_id,
        b.booking_id AS id,
        b.booking_code,
        b.booking_code AS bookingReference,
        b.rental_start AS startDate,
        b.rental_end AS endDate,
        b.duration_days AS totalDays,
        b.equipment_subtotal AS subtotalAmount,
        b.tax_amount AS taxAmount,
        b.total_amount AS totalAmount,
        b.booking_status AS status,
        b.needs_technician AS requiresTechnician,
        b.delivery_address AS deliveryAddress,
        b.customer_notes AS notes,
        b.created_at AS createdAt
       FROM bookings b
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    if (bookings.length === 0) return [];

    const bookingIds = bookings.map((b) => b.booking_id);
    const [items] = await pool.query(
      `SELECT 
        bi.booking_id,
        bi.equipment_id,
        bi.quantity,
        bi.daily_rate_at_booking AS unitPrice,
        bi.line_total AS lineTotal,
        e.equipment_name AS name,
        e.image_url AS imageUrl,
        c.name AS categoryName
       FROM booking_items bi
       JOIN equipment e ON bi.equipment_id = e.equipment_id
       JOIN categories c ON e.category_id = c.category_id
       WHERE bi.booking_id IN (?)`,
      [bookingIds]
    );

    const itemsByBooking = items.reduce((acc, item) => {
      if (!acc[item.booking_id]) acc[item.booking_id] = [];
      acc[item.booking_id].push({
        equipmentId: item.equipment_id,
        name: item.name,
        category: item.categoryName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        imageUrl: item.imageUrl,
      });
      return acc;
    }, {});

    return bookings.map((b) => ({
      ...b,
      subtotalAmount: Number(b.subtotalAmount),
      taxAmount: Number(b.taxAmount),
      totalAmount: Number(b.totalAmount),
      items: itemsByBooking[b.booking_id] || [],
    }));
  }

  /**
   * Retrieves single booking details.
   */
  static async getById(bookingId, userId = null, role = null) {
    const [bookings] = await pool.query(
      `SELECT 
        b.*,
        u.full_name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone
       FROM bookings b
       JOIN users u ON b.customer_id = u.user_id
       WHERE (b.booking_id = ? OR b.booking_code = ?)
       LIMIT 1`,
      [bookingId, bookingId]
    );

    if (bookings.length === 0) {
      const err = new Error(`Booking ${bookingId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const booking = bookings[0];

    // Authorization check: only owner or admin can view
    if (role !== 'ADMIN' && role !== 'STAFF' && booking.customer_id !== userId) {
      const err = new Error('Access denied. You do not have permission to view this booking.');
      err.statusCode = 403;
      throw err;
    }

    const [items] = await pool.query(
      `SELECT 
        bi.booking_item_id,
        bi.equipment_id,
        bi.quantity,
        bi.daily_rate_at_booking,
        bi.line_total,
        e.equipment_name AS name,
        e.image_url,
        e.sku,
        c.name AS category_name
       FROM booking_items bi
       JOIN equipment e ON bi.equipment_id = e.equipment_id
       JOIN categories c ON e.category_id = c.category_id
       WHERE bi.booking_id = ?`,
      [booking.booking_id]
    );

    const [payments] = await pool.query(
      `SELECT payment_id, amount, currency, payment_method, payment_status, provider_transaction_id, paid_at
       FROM payments
       WHERE booking_id = ?
       ORDER BY created_at DESC`,
      [booking.booking_id]
    );

    return {
      ...booking,
      id: booking.booking_code,
      bookingId: booking.booking_id,
      bookingCode: booking.booking_code,
      bookingReference: booking.booking_code,
      eventName: booking.customer_notes || `${booking.client_name}'s Event Production`,
      venueName: booking.delivery_address || 'Main Venue Stage',
      venueAddress: booking.delivery_address || 'Main Venue Stage Address',
      eventType: 'Live Event Production',
      startDate: typeof booking.rental_start === 'string' ? booking.rental_start.slice(0, 10) : booking.rental_start,
      endDate: typeof booking.rental_end === 'string' ? booking.rental_end.slice(0, 10) : booking.rental_end,
      durationDays: Number(booking.duration_days),
      totalDays: Number(booking.duration_days),
      clientName: booking.client_name,
      company: booking.client_company || 'Production Agency',
      clientEmail: booking.client_email,
      clientPhone: booking.client_phone,
      needsTechnician: Boolean(booking.needs_technician),
      technicianFee: Number(booking.technician_fee),
      deliveryFee: Number(booking.delivery_fee),
      equipmentSubtotal: Number(booking.equipment_subtotal),
      equipment_subtotal: Number(booking.equipment_subtotal),
      taxAmount: Number(booking.tax_amount),
      tax_amount: Number(booking.tax_amount),
      totalAmount: Number(booking.total_amount),
      total_amount: Number(booking.total_amount),
      status: (booking.booking_status || 'PENDING').toLowerCase(),
      booking_status: booking.booking_status,
      createdAt: booking.created_at,
      specialInstructions: booking.customer_notes,
      items: items.map((i) => ({
        ...i,
        name: i.name,
        category: i.category_name,
        quantity: Number(i.quantity),
        dailyRate: Number(i.daily_rate_at_booking),
        daily_rate_at_booking: Number(i.daily_rate_at_booking),
        subtotal: Number(i.line_total),
        line_total: Number(i.line_total),
      })),
      payments: payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };
  }

  /**
   * Cancels a booking and releases locked inventory.
   */
  static async cancelBooking(bookingId, userId, role, reason = 'Cancelled by user') {
    const booking = await this.getById(bookingId, userId, role);

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.booking_status)) {
      const err = new Error(`Cannot cancel booking with status ${booking.booking_status}`);
      err.statusCode = 400;
      throw err;
    }

    await pool.query(
      `UPDATE bookings 
       SET booking_status = 'CANCELLED', customer_notes = CONCAT(COALESCE(customer_notes, ''), ' [Cancelled: ', ?, ']')
       WHERE booking_id = ?`,
      [reason, booking.booking_id]
    );

    return {
      bookingId: booking.booking_id,
      status: 'CANCELLED',
      message: 'Booking successfully cancelled. Inventory released.',
    };
  }
}
