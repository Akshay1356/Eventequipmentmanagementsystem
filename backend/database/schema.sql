-- ==============================================================================
-- AURA Event Equipment Booking System — Authoritative Database Schema (MySQL 8.0+)
-- Database: event_equipment_db
-- Storage Engine: InnoDB
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS event_equipment_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_equipment_db;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Accounts for Customers, Staff, and Administrators.
-- Email is strictly unique. Passwords store high-entropy bcrypt hashes only.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  company VARCHAR(150) NULL,
  role ENUM('CUSTOMER', 'ADMIN', 'STAFF') NOT NULL DEFAULT 'CUSTOMER',
  account_status ENUM('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. VENDORS TABLE
-- Manufacturers, distributors, and third-party AV sub-hire partners.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id VARCHAR(36) NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(150) NULL,
  email VARCHAR(191) NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vendor_id),
  INDEX idx_vendors_name (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES TABLE
-- Event equipment classifications (Audio, Lighting, Projection, Staging, etc.).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  category_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. EQUIPMENT TABLE
-- Physical gear catalogue with daily rental pricing, stock, specs, and status.
-- Monetary values use DECIMAL(10, 2) to eliminate floating-point discrepancies.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id VARCHAR(50) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  vendor_id VARCHAR(36) NULL,
  equipment_name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  short_desc VARCHAR(255) NULL,
  description TEXT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  replacement_value DECIMAL(10, 2) NULL,
  total_quantity INT NOT NULL DEFAULT 1,
  unit VARCHAR(50) NOT NULL DEFAULT 'per day',
  condition_status ENUM('EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_SERVICE') NOT NULL DEFAULT 'EXCELLENT',
  listing_status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
  image_url VARCHAR(500) NULL,
  images JSON NULL,
  specifications JSON NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (equipment_id),
  UNIQUE KEY uq_equipment_sku (sku),
  INDEX idx_equipment_category (category_id),
  INDEX idx_equipment_vendor (vendor_id),
  INDEX idx_equipment_status (listing_status),
  INDEX idx_equipment_daily_rate (daily_rate),
  INDEX idx_equipment_featured (featured),
  CONSTRAINT chk_equip_daily_rate CHECK (daily_rate >= 0),
  CONSTRAINT chk_equip_total_qty CHECK (total_quantity >= 0),
  CONSTRAINT fk_equip_category FOREIGN KEY (category_id)
    REFERENCES categories (category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_equip_vendor FOREIGN KEY (vendor_id)
    REFERENCES vendors (vendor_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. VENUES TABLE
-- Event locations, addresses, technical load-in docks, and power parameters.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
  venue_id VARCHAR(36) NOT NULL,
  venue_name VARCHAR(200) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NULL,
  postal_code VARCHAR(20) NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  dock_details TEXT NULL,
  power_available VARCHAR(150) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (venue_id),
  INDEX idx_venues_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. EVENTS TABLE
-- Specific event engagements registered by customers.
-- Validates that end_at strictly succeeds start_at.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  event_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  venue_id VARCHAR(36) NULL,
  event_name VARCHAR(200) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  expected_attendees INT NULL,
  special_requirements TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  INDEX idx_events_customer (customer_id),
  INDEX idx_events_venue (venue_id),
  INDEX idx_events_dates (start_at, end_at),
  CONSTRAINT chk_event_dates CHECK (end_at > start_at),
  CONSTRAINT chk_event_attendees CHECK (expected_attendees IS NULL OR expected_attendees >= 0),
  CONSTRAINT fk_events_customer FOREIGN KEY (customer_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_events_venue FOREIGN KEY (venue_id)
    REFERENCES venues (venue_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. BOOKINGS TABLE
-- High-level equipment rental contract and order lifecycle.
-- Inventory-reserving statuses: PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, ACTIVE
-- Non-reserving statuses: COMPLETED, CANCELLED, REJECTED
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  booking_id VARCHAR(50) NOT NULL,
  booking_code VARCHAR(30) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NULL,
  booking_status ENUM(
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
  ) NOT NULL DEFAULT 'PENDING',
  rental_start DATETIME NOT NULL,
  rental_end DATETIME NOT NULL,
  duration_days INT NOT NULL DEFAULT 1,
  delivery_address TEXT NOT NULL,
  needs_technician BOOLEAN NOT NULL DEFAULT FALSE,
  technician_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  equipment_subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  client_email VARCHAR(191) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_company VARCHAR(150) NULL,
  customer_notes TEXT NULL,
  admin_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id),
  UNIQUE KEY uq_bookings_code (booking_code),
  INDEX idx_bookings_customer (customer_id),
  INDEX idx_bookings_event (event_id),
  INDEX idx_bookings_status (booking_status),
  INDEX idx_bookings_dates (rental_start, rental_end),
  CONSTRAINT chk_booking_dates CHECK (rental_end > rental_start),
  CONSTRAINT chk_booking_duration CHECK (duration_days >= 1),
  CONSTRAINT chk_booking_amounts CHECK (
    equipment_subtotal >= 0 AND
    technician_fee >= 0 AND
    delivery_fee >= 0 AND
    discount_amount >= 0 AND
    tax_amount >= 0 AND
    total_amount >= 0
  ),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_event FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. BOOKING_ITEMS TABLE
-- Line items for individual gear assets in an order.
-- Stores agreed daily_rate_at_booking for immutable financial records.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_items (
  booking_item_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(50) NOT NULL,
  equipment_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  daily_rate_at_booking DECIMAL(10, 2) NOT NULL,
  rental_days INT NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  item_notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_item_id),
  UNIQUE KEY uq_booking_equipment (booking_id, equipment_id),
  INDEX idx_booking_items_equip (equipment_id),
  CONSTRAINT chk_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_item_days CHECK (rental_days >= 1),
  CONSTRAINT chk_item_rates CHECK (daily_rate_at_booking >= 0 AND line_total >= 0),
  CONSTRAINT fk_bitems_booking FOREIGN KEY (booking_id)
    REFERENCES bookings (booking_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_bitems_equipment FOREIGN KEY (equipment_id)
    REFERENCES equipment (equipment_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS TABLE
-- Ledger for financial transactions associated with reservations.
-- Sensitive credit card details are NEVER stored locally.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  payment_id VARCHAR(36) NOT NULL,
  booking_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  payment_method ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'UPI', 'INVOICE', 'CASH') NOT NULL DEFAULT 'UPI',
  payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY_OFFLINE',
  provider_transaction_id VARCHAR(100) NULL,
  paid_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payments_txn (provider_transaction_id),
  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_status (payment_status),
  CONSTRAINT chk_payment_amount CHECK (amount >= 0),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id)
    REFERENCES bookings (booking_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. MAINTENANCE TABLE
-- Schedules equipment servicing, bench recalibration, or repairs that reduce
-- available inventory across the designated date window.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
  maintenance_id VARCHAR(36) NOT NULL,
  equipment_id VARCHAR(50) NOT NULL,
  quantity_unavailable INT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  maintenance_status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  description TEXT NOT NULL,
  created_by VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (maintenance_id),
  INDEX idx_maint_equipment (equipment_id),
  INDEX idx_maint_dates (start_at, end_at),
  INDEX idx_maint_status (maintenance_status),
  CONSTRAINT chk_maint_dates CHECK (end_at > start_at),
  CONSTRAINT chk_maint_quantity CHECK (quantity_unavailable > 0),
  CONSTRAINT fk_maint_equipment FOREIGN KEY (equipment_id)
    REFERENCES equipment (equipment_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_maint_creator FOREIGN KEY (created_by)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. STAFF TABLE
-- Profiles and operational specializations for STAFF user accounts.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  staff_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NULL,
  hourly_rate DECIMAL(10, 2) NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id),
  UNIQUE KEY uq_staff_user (user_id),
  INDEX idx_staff_available (is_available),
  CONSTRAINT chk_staff_rate CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. EVENT_STAFF TABLE
-- Assignment mapping linking crew technicians to specific event productions.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_staff (
  event_staff_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NOT NULL,
  staff_id VARCHAR(36) NOT NULL,
  assignment_role VARCHAR(100) NOT NULL,
  assignment_status ENUM('ASSIGNED', 'CONFIRMED', 'DECLINED', 'COMPLETED') NOT NULL DEFAULT 'ASSIGNED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_staff_id),
  UNIQUE KEY uq_event_staff_pair (event_id, staff_id),
  INDEX idx_event_staff_role (assignment_role),
  CONSTRAINT fk_estaff_event FOREIGN KEY (event_id)
    REFERENCES events (event_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_estaff_staff FOREIGN KEY (staff_id)
    REFERENCES staff (staff_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
