# AURA Event Equipment Management System — Full-Stack Backend API

Production-grade RESTful API built with **Node.js**, **Express**, and **MySQL 8.0+** using the high-performance `mysql2/promise` connection pool.

---

## 1. System Architecture

```
                                  +-----------------------------+
                                  |    React 19 + Vite Frontend |
                                  |    (Vercel / Local :5173)   |
                                  +--------------+--------------+
                                                 |
                                     JSON REST API / Bearer JWT
                                                 |
                                                 v
                      +----------------------------------------------------+
                      |            Express Application Server              |
                      |                 (Port 5000)                        |
                      |  - Helmet & CORS Middleware                        |
                      |  - JWT Authentication & Role Authorization (RBAC)  |
                      |  - Express-Validator Payload Sanitization          |
                      |  - Standard Response Envelopes & Central Logger    |
                      +--------------------------+-------------------------+
                                                 |
                      +--------------------------+-------------------------+
                      |                 Service Layer                      |
                      |  - AuthService (bcryptjs hashing, JWT issue)       |
                      |  - EquipmentService (Dynamic interval availability)|
                      |  - BookingService (ACID transactions, FOR UPDATE)  |
                      |  - AdminService (Stock controls, status workflows) |
                      +--------------------------+-------------------------+
                                                 |
                                 mysql2 Connection Pool
                                                 |
                                                 v
                      +----------------------------------------------------+
                      |             MySQL 8.0+ Relational DB               |
                      |                 (InnoDB Engine)                    |
                      |  - 12 Normalized Tables (3NF)                      |
                      |  - Foreign Key Constraints with Cascade Options    |
                      |  - Row-Level Locking (`FOR UPDATE`) for bookings   |
                      |  - High-Efficiency B-Tree Composite Indexes        |
                      +----------------------------------------------------+
```

---

## 2. Directory Structure

```
backend/
├── database/
│   ├── schema.sql                 # Complete DDL (12 tables + indexes)
│   ├── ER_DIAGRAM.md              # Mermaid diagram + relationship specs
│   ├── README.md                  # Database installation & CLI commands
│   ├── migrations/
│   │   └── 001_initial_schema.sql # First timestamped migration
│   └── seeds/
│       └── 001_seed_categories.sql# Category baseline records
├── src/
│   ├── config/
│   │   ├── database.js            # mysql2 pool, health ping & withTransaction
│   │   └── env.js                 # Environment validation & defaults
│   ├── controllers/
│   │   ├── admin.controller.js    # Inventory oversight & order operations
│   │   ├── auth.controller.js     # Register, login, profile
│   │   ├── booking.controller.js  # Transactional bookings & user history
│   │   ├── category.controller.js # Category listings
│   │   └── equipment.controller.js# Filtered equipment & availability
│   ├── middleware/
│   │   ├── auth.middleware.js     # requireAuth, requireRole, optionalAuth
│   │   ├── error.middleware.js    # notFoundHandler & central errorHandler
│   │   └── validate.middleware.js # Express-validator result parser
│   ├── routes/
│   │   ├── admin.routes.js        # /api/admin/*
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── booking.routes.js      # /api/bookings/*
│   │   ├── category.routes.js     # /api/categories
│   │   ├── equipment.routes.js    # /api/equipment/*
│   │   └── health.routes.js       # /api/health
│   ├── scripts/
│   │   ├── createAdminUser.js     # CLI admin user provisioning
│   │   └── seedEquipmentCatalogue.js # Seeds 24 equipment items with INR rates
│   ├── services/
│   │   ├── admin.service.js
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── category.service.js
│   │   └── equipment.service.js
│   ├── utils/
│   │   ├── logger.util.js         # Structured ISO logger
│   │   └── response.util.js       # Standard sendSuccess / sendError
│   ├── app.js                     # Express app instance & router mounting
│   └── server.js                  # HTTP listener & graceful shutdown
├── tests/
│   ├── health.test.js             # Health check test
│   ├── pricing.test.js            # Financial logic & day calculations
│   └── validation.test.js         # Request validation & unauthorized checks
├── .env.example                   # Environment configuration template
├── package.json                   # ESM module configuration & scripts
└── README.md
```

---

## 3. Database Setup & Initialization

### Option A: Via Command Line (PowerShell / Command Prompt)

1. Start your local MySQL Server service if it is stopped:
   ```powershell
   Start-Service MySQL80
   ```
2. Navigate to the backend directory and execute the schema:
   ```powershell
   cd backend
   Get-Content database/schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```
3. Run the category seed:
   ```powershell
   Get-Content database/seeds/001_seed_categories.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p event_equipment_db
   ```

### Option B: Via MySQL Workbench
1. Open **MySQL Workbench** and connect to your local instance.
2. Click **File -> Open SQL Script...** and select `backend/database/schema.sql`.
3. Click the **Execute (Lightning Bolt)** icon to create `event_equipment_db` and its 12 tables.
4. Open `backend/database/seeds/001_seed_categories.sql` and execute it.

---

## 4. Backend Configuration & Startup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your MySQL password:
   ```ini
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=event_equipment_db
   DB_CONNECTION_LIMIT=10

   JWT_SECRET=event_equipment_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   ```

3. Seed the 24 equipment catalogue items:
   ```bash
   npm run seed:catalogue
   ```

4. Create an Admin account:
   ```bash
   npm run create:admin
   ```
   *(Default credentials: `admin@eventhub.com` / `Admin@1234`)*

5. Start the development server:
   ```bash
   npm run dev
   ```
   The API will listen on `http://localhost:5000/api`.

---

## 5. Running Automated Tests

Run the complete test suite (health checks, booking pricing rules, auth validation):
```bash
npm test
```

---

## 6. API Reference

### Health
- `GET /api/health` — Returns server uptime and live MySQL connection status.

### Authentication
- `POST /api/auth/register` — Create new customer account (`fullName`, `email`, `password`, `phone`).
- `POST /api/auth/login` — Log in with email & password; returns Bearer JWT.
- `GET /api/auth/me` — Return current authenticated profile (Requires `Authorization: Bearer <token>`).

### Categories
- `GET /api/categories` — List all active equipment categories.

### Equipment & Availability
- `GET /api/equipment` — Retrieve equipment catalogue with query filters:
  - `category`: Category code or name
  - `search`: Keyword search in name, brand, model, description
  - `condition`: `EXCELLENT`, `GOOD`, `FAIR`
  - `startDate` & `endDate`: Computes real-time available stock excluding active reservations and scheduled maintenance.
- `GET /api/equipment/:id` — Details for single item.

### Bookings (Concurrency Safe)
- `POST /api/bookings` — Create booking inside MySQL transaction with `FOR UPDATE` row-level locking.
- `GET /api/bookings/my` — Get bookings for the authenticated user.
- `GET /api/bookings/:id` — Get single booking details (Customer or Admin).
- `PATCH /api/bookings/:id/cancel` — Cancel booking and release reserved units.

### Admin Operations (`ADMIN` role required)
- `GET /api/admin/inventory` — Full stock report with live availability.
- `POST /api/admin/inventory` — Add new equipment asset.
- `PATCH /api/admin/inventory/:id` — Update equipment attributes or status.
- `GET /api/admin/bookings` — All customer bookings with payment statuses.
- `PATCH /api/admin/bookings/:id/status` — Advance booking workflow status (`PREPARING`, `OUT_FOR_DELIVERY`, `ACTIVE`, `COMPLETED`, `CANCELLED`).

---

## 7. Connecting Frontend to Live Backend

In your frontend root directory:
1. Create or edit `.env.local`:
   ```ini
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_USE_MOCK_DATA=false
   ```
2. Run the frontend:
   ```bash
   npm run dev
   ```
3. When `VITE_USE_MOCK_DATA=false`, the website talks directly to your Node.js + Express + MySQL server.
4. When `VITE_USE_MOCK_DATA=true` (or `.env.local` omitted), the website operates in client-side demonstration mode with hardcoded credentials (`admin` / `admin` and `user` / `user`).

---

## 8. Production Cloud Deployment Guide

### Database Hosting Options
- **Aiven for MySQL** (Free tier / Startup): Provides a managed MySQL 8.0 URI with SSL (`mysql://...`).
- **Railway / TiDB Cloud / PlanetScale**: One-click managed MySQL database instance.

To initialize any cloud database in one command:
```bash
# Provide your cloud DATABASE_URL or set it in backend/.env:
DATABASE_URL="mysql://avnadmin:your_password@your-db-host.aivencloud.com:port/defaultdb?ssl-mode=REQUIRED" npm run db:cloud
```
This automatically runs all 12 table creation DDL statements, inserts default categories, populates all 24 equipment items with INR rates, and provisions both `admin@aura.com` / `admin123` and `user@aura.com` / `user123`.

### Backend Hosting
- Deploy the `backend/` folder to **Render**, **Railway**, **Fly.io**, or **AWS ECS/EC2**.
- Set production environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `CLIENT_URL=https://eventequipmentmanagementsystem.vercel.app`, `JWT_SECRET`).

### Frontend (Vercel)
- In the Vercel Project Settings -> Environment Variables:
  - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
  - `VITE_USE_MOCK_DATA`: `false`
- Trigger redeployment on Vercel.
