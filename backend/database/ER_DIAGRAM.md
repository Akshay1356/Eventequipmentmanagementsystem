# AURA Event Equipment Management System — Entity Relationship Diagram

This document specifies the relational database model for **`event_equipment_db`** (MySQL 8.0+ / InnoDB engine).

---

## 1. Visual Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ events : "registers"
    users ||--o{ bookings : "places"
    users ||--o| staff : "profile_for"
    users ||--o{ maintenance : "logs"

    vendors ||--o{ equipment : "supplies"
    categories ||--o{ equipment : "classifies"

    venues ||--o{ events : "hosts"
    events ||--o{ bookings : "associates"
    events ||--o{ event_staff : "assigned_to"
    staff ||--o{ event_staff : "assigned_to"

    bookings ||--|{ booking_items : "contains"
    equipment ||--o{ booking_items : "reserved_in"
    bookings ||--o{ payments : "paid_via"

    equipment ||--o{ maintenance : "undergoes"

    users {
        string user_id PK
        string full_name
        string email UK
        string password_hash
        string phone
        string company
        enum role "CUSTOMER, ADMIN, STAFF"
        enum account_status "ACTIVE, SUSPENDED, PENDING_VERIFICATION"
        timestamp created_at
        timestamp updated_at
    }

    vendors {
        string vendor_id PK
        string company_name
        string contact_name
        string email
        string phone
        text address
        timestamp created_at
    }

    categories {
        string category_id PK
        string name UK
        string slug UK
        text description
        timestamp created_at
    }

    equipment {
        string equipment_id PK
        string category_id FK
        string vendor_id FK
        string equipment_name
        string sku UK
        string brand
        string model
        decimal daily_rate
        int total_quantity
        enum condition_status
        enum listing_status "ACTIVE, INACTIVE, DISCONTINUED"
        json specifications
        boolean featured
        timestamp created_at
    }

    venues {
        string venue_id PK
        string venue_name
        string address_line1
        string city
        string state
        string country
        text dock_details
        string power_available
        timestamp created_at
    }

    events {
        string event_id PK
        string customer_id FK
        string venue_id FK
        string event_name
        string event_type
        datetime start_at
        datetime end_at
        int expected_attendees
        timestamp created_at
    }

    bookings {
        string booking_id PK
        string booking_code UK
        string customer_id FK
        string event_id FK
        enum booking_status "PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, ACTIVE, COMPLETED, CANCELLED, REJECTED"
        datetime rental_start
        datetime rental_end
        int duration_days
        decimal equipment_subtotal
        decimal technician_fee
        decimal total_amount
        string client_name
        string client_email
        timestamp created_at
    }

    booking_items {
        string booking_item_id PK
        string booking_id FK
        string equipment_id FK
        int quantity
        decimal daily_rate_at_booking
        int rental_days
        decimal line_total
        timestamp created_at
    }

    payments {
        string payment_id PK
        string booking_id FK
        decimal amount
        string currency
        enum payment_method
        enum payment_status
        string provider
        string provider_transaction_id UK
        datetime paid_at
        timestamp created_at
    }

    maintenance {
        string maintenance_id PK
        string equipment_id FK
        int quantity_unavailable
        datetime start_at
        datetime end_at
        enum maintenance_status
        text description
        string created_by FK
        timestamp created_at
    }

    staff {
        string staff_id PK
        string user_id FK,UK
        string job_title
        string specialization
        decimal hourly_rate
        boolean is_available
        timestamp created_at
    }

    event_staff {
        string event_staff_id PK
        string event_id FK
        string staff_id FK
        string assignment_role
        enum assignment_status
        timestamp created_at
    }
```

---

## 2. Table Specifications and Relationship Rules

| Table Name | Primary Key | Foreign Keys | Key Constraints & Integrity Rules |
| :--- | :--- | :--- | :--- |
| **`users`** | `user_id` (UUID/VARCHAR) | None | Unique `email`. Check constraints on roles. Passwords stored only as bcrypt hashes. |
| **`vendors`** | `vendor_id` (UUID/VARCHAR) | None | Vendor details. `ON DELETE SET NULL` on referencing equipment. |
| **`categories`** | `category_id` (VARCHAR) | None | Unique `name` and `slug`. `ON DELETE RESTRICT` protects catalog hierarchy. |
| **`equipment`** | `equipment_id` (VARCHAR) | `category_id`, `vendor_id` | Unique `sku`. Check `daily_rate >= 0` and `total_quantity >= 0`. Indexed on `category_id`, `listing_status`, `daily_rate`. |
| **`venues`** | `venue_id` (UUID/VARCHAR) | None | Physical locations with dock & power details. |
| **`events`** | `event_id` (UUID/VARCHAR) | `customer_id`, `venue_id` | Check `end_at > start_at`. Protected customer history with `ON DELETE RESTRICT`. |
| **`bookings`** | `booking_id` (VARCHAR) | `customer_id`, `event_id` | Unique `booking_code`. Check `rental_end > rental_start`. Financial fields stored in `DECIMAL(10,2)`. |
| **`booking_items`**| `booking_item_id` (UUID) | `booking_id`, `equipment_id` | Composite UNIQUE(`booking_id`, `equipment_id`). Frozen `daily_rate_at_booking`. `ON DELETE CASCADE` from booking. |
| **`payments`** | `payment_id` (UUID) | `booking_id` | Unique `provider_transaction_id`. Never stores raw credit card credentials. `ON DELETE RESTRICT` protects audit logs. |
| **`maintenance`** | `maintenance_id` (UUID) | `equipment_id`, `created_by` | Check `end_at > start_at` and `quantity_unavailable > 0`. Reduces available booking stock for date overlap. |
| **`staff`** | `staff_id` (UUID) | `user_id` | 1-to-1 extension of `users` (`user_id` is UNIQUE). `ON DELETE CASCADE` with user account. |
| **`event_staff`** | `event_staff_id` (UUID) | `event_id`, `staff_id` | Composite UNIQUE(`event_id`, `staff_id`). Tracks technician staffing per event production. |

---

## 3. Availability Calculation Logic

For any given `equipment_id` over a half-open rental period $[T_{\text{start}}, T_{\text{end}})$:

$$\text{Available Quantity} = Q_{\text{total}} - Q_{\text{reserved}} - Q_{\text{maintenance}}$$

Where:
1. $Q_{\text{total}}$ is `equipment.total_quantity`.
2. $Q_{\text{reserved}}$ is the sum of `booking_items.quantity` for all overlapping bookings where `bookings.booking_status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'ACTIVE')` and:
   $$\text{rental\_start} < T_{\text{end}} \quad \text{AND} \quad \text{rental\_end} > T_{\text{start}}$$
3. $Q_{\text{maintenance}}$ is the sum of `maintenance.quantity_unavailable` for all overlapping records where `maintenance_status IN ('SCHEDULED', 'IN_PROGRESS')` and:
   $$\text{start\_at} < T_{\text{end}} \quad \text{AND} \quad \text{end\_at} > T_{\text{start}}$$
