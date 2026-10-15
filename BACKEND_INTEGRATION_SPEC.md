# AURA Event Gear — Backend & Database Integration Specification

This document provides the definitive HTTP API contract and relational database schema specification for connecting the AURA Event Equipment Booking System frontend with the backend server and SQL database.

---

## 1. Architectural Overview & Configuration

The frontend is architected with a decoupled service layer. By default, the application runs in **Mock Demo Mode** using in-memory / session storage datasets.

To switch to the live backend:
1. In `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_USE_MOCK_DATA=false
   ```
2. The central HTTP client (`src/services/apiClient.js`) automatically forwards requests to the configured `VITE_API_BASE_URL`.

All API responses must use JSON formatting and standard HTTP status codes:
- `200 OK`: Successful GET / PATCH / PUT operation.
- `201 Created`: Successful POST creation.
- `400 Bad Request`: Validation failure (missing fields, invalid date ranges).
- `401 Unauthorized`: Missing or invalid JWT Bearer token.
- `403 Forbidden`: Insufficient role permissions (e.g. non-admin accessing admin routes).
- `404 Not Found`: Resource ID not found.
- `409 Conflict`: Business logic conflict (e.g., equipment out of stock for requested dates).

### Standard Error Response Format
```json
{
  "error": "EQUIPMENT_UNAVAILABLE",
  "message": "Only 2 units of L-Acoustics K2 are available for the selected dates."
}
```

---

## 2. Recommended Relational Database Schema (SQL DDL)

Below is the recommended PostgreSQL / MySQL relational schema for the DBMS project:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(150),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Equipment Categories
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Equipment Inventory
CREATE TABLE equipment (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    category_label VARCHAR(100),
    short_desc VARCHAR(255),
    description TEXT,
    daily_rate NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'per day',
    image_url VARCHAR(500),
    stock INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'reserved')),
    features JSONB,
    specs JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings / Reservations
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'AURA-2026-8812'
    user_id VARCHAR(36) REFERENCES users(id),
    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    venue_name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(150) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_company VARCHAR(150),
    needs_technician BOOLEAN DEFAULT FALSE,
    special_requirements TEXT,
    equipment_subtotal NUMERIC(10, 2) NOT NULL,
    technician_cost NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Booking Items (Join table for items reserved in a booking)
CREATE TABLE booking_items (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    equipment_id VARCHAR(50) REFERENCES equipment(id),
    equipment_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    daily_rate NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    line_total NUMERIC(10, 2) NOT NULL
);
```

---

## 3. Endpoints Specification

### 3.1 Authentication
- **`POST /api/auth/login`**
  - **Body**: `{ "email": "alex@example.com", "password": "password123" }`
  - **Response 200**:
    ```json
    {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr-1",
        "name": "Alex Rivera",
        "email": "alex@example.com",
        "role": "customer",
        "company": "Apex Live Productions"
      }
    }
    ```
- **`POST /api/auth/register`**
  - **Body**: `{ "name": "...", "email": "...", "password": "...", "company": "..." }`
  - **Response 201**: Returns created user object and JWT token.
- **`GET /api/auth/me`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200**: Returns current authenticated user profile.

---

### 3.2 Equipment & Inventory (`src/services/equipmentService.js`)
- **`GET /api/equipment`**
  - **Query Parameters**:
    - `category`: string (optional, e.g. `'audio'`, `'lighting'`)
    - `q`: search string (optional, matches name, brand, description)
    - `sort`: string (`'recommended'`, `'rate_asc'`, `'rate_desc'`, `'name_asc'`)
  - **Response 200**:
    ```json
    {
      "data": [
        {
          "id": "eq-audio-01",
          "name": "L-Acoustics K2 Line Source",
          "brand": "L-Acoustics",
          "model": "K2 Full-Range",
          "category": "audio",
          "categoryLabel": "Audio Systems",
          "shortDesc": "Variable curvature WST enclosure for arenas and outdoor festivals.",
          "dailyRate": 650,
          "unit": "per box/day",
          "imageUrl": "https://...",
          "stock": 16,
          "availableQuantity": 12,
          "status": "available",
          "features": ["Panflex horizontal directivity", "Max SPL: 147 dB"],
          "specs": {
            "Frequency Response": "35 Hz - 20 kHz",
            "Nominal Directivity": "70° / 110° symmetric",
            "Weight": "56 kg / 123 lbs"
          }
        }
      ],
      "total": 14
    }
    ```
- **`GET /api/equipment/:id`**
  - **Response 200**: Single equipment item detail.
  - **Response 404**: `{ "error": "NOT_FOUND", "message": "Equipment not found." }`

---

### 3.3 Bookings & Reservations (`src/services/bookingService.js`)
- **`POST /api/bookings`**
  - **Headers**: `Authorization: Bearer <token>` (optional if guest reservation permitted)
  - **Body**:
    ```json
    {
      "equipmentId": "eq-audio-01",
      "quantity": 2,
      "eventName": "Neon Wave Electronic Festival",
      "eventType": "Music Festival / Concert",
      "venueName": "Pacific Amphitheatre, Costa Mesa",
      "startDate": "2026-11-20",
      "endDate": "2026-11-23",
      "durationDays": 3,
      "clientName": "Alex Rivera",
      "clientEmail": "alex.rivera@apexevents.com",
      "clientPhone": "+1 (555) 382-9012",
      "clientCompany": "Apex Live Productions LLC",
      "needsTechnician": true,
      "specialRequirements": "Require rigging hoist brackets and fly-bars.",
      "equipmentSubtotal": 3900,
      "technicianCost": 1050,
      "totalAmount": 4950
    }
    ```
  - **Response 201**:
    ```json
    {
      "success": true,
      "message": "Booking request submitted successfully.",
      "data": {
        "id": "AURA-2026-9281",
        "status": "pending",
        "createdAt": "2026-10-15T14:30:00.000Z",
        "totalAmount": 4950
      }
    }
    ```
- **`GET /api/bookings/my`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200**: List of bookings associated with the current user.
- **`GET /api/bookings/:id`**
  - **Response 200**: Detailed booking manifest including equipment item line items.
- **`PATCH /api/bookings/:id/cancel`**
  - **Response 200**:
    ```json
    {
      "success": true,
      "message": "Booking cancelled and gear returned to inventory pool."
    }
    ```

---

### 3.4 Admin Control Endpoints (`src/services/adminService.js`)
- **`GET /api/admin/bookings`**
  - Returns all system reservations across all clients.
- **`PATCH /api/admin/bookings/:id/status`**
  - **Body**: `{ "status": "confirmed" }` (or `"completed"`, `"cancelled"`)
  - **Response 200**: Updated booking status.
- **`GET /api/admin/inventory`**
  - Returns complete inventory list with total stock, available quantity, and utilization metrics.
- **`PATCH /api/admin/inventory/:id/stock`**
  - **Body**: `{ "stock": 20, "availableQuantity": 16 }`
  - **Response 200**: Updated inventory record.
- **`POST /api/admin/inventory`**
  - **Body**: New equipment item object.
  - **Response 201**: Newly created equipment record.
