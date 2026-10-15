# AURA EVENT GEAR — Event Equipment Booking System

> A dark cinematic, high-performance web platform for reserving professional event audiovisual gear, concert stage lighting, LED video walls, and tour production hardware. Built for a college Database Management Systems (DBMS) project.

---

## 🌟 Key Features

### 1. Dark Cinematic Experience & Visual Identity
- **Refined Dark Palette**: `#020204` abyss background, `#0A111D` elevated surfaces, `#38BDF8` electric cyan and `#7DE7FF` high-contrast accents.
- **3D Perspective Equipment Carousel**: Smooth CSS 3D ring carousel with continuous rotation, hover pause, reduced motion detection, and graceful image fallback.
- **Micro-Interactions & Glassmorphism**: Restrained glass card surfaces, glowing accents on focus, and clean layout transitions without excessive neon clutter.

### 2. Comprehensive Equipment Catalogue (`/equipment`)
- **14 Pro-Grade Equipment Items** spanning 7 primary production categories:
  - Audio Systems (Line arrays, subwoofers, wireless mics)
  - Intelligent Lighting (Moving head beams, wash lights)
  - Video & LED Displays (Ultra HD modular tiles, laser projectors)
  - Stage & Trussing (Eurotruss box truss, modular platforms)
  - Furniture & Hospitality (Illuminated bar setups, lounge seating)
  - DJ & Performance Gear (Pioneer DJ four-channel flagship setups)
  - Event Accessories & Power (3-phase distro, haze atmospheric generators)
- **Live Search & URL Filtering**: Instant text search, category tabs, and price/name sorting synced directly with browser URL search parameters for shareable views.

### 3. Equipment Detail & Cost Estimator (`/equipment/:id`)
- High-resolution imagery with category badge and verified rental rates.
- Specifications grid and engineering feature checklists.
- **Interactive Rental Estimator**: Dynamically computes real-time costs based on calendar duration and requested units.
- Direct CTA to the booking checkout workflow.

### 4. Booking & Reservation Checkout (`/book/:id`)
- Multi-step reservation form with production date pickers (Start Date, End Date).
- Automated duration calculation (minimum 1 day).
- Available stock limits enforcement.
- **On-site Audio/Lighting Technician Add-on** option (\$350/day flat rate).
- Production details collection (Event Name, Venue/City, Production Type, Special Staging Notes).
- Instant confirmation screen with reference code (e.g., `AURA-2026-XXXX`).

### 5. Customer Dashboard & Reservation Tracking (`/my-bookings`)
- Historical and active bookings overview.
- Status filtering tabs: **All**, **Pending**, **Confirmed**, **Completed**, **Cancelled**.
- Reservation Manifest modal (`/my-bookings/:id`) displaying full logistics, venue, duration, technician assignments, and itemized billing.
- In-place cancellation modal for pending bookings that safely returns allocated units to the available pool.

### 6. Administrative Dispatch & Inventory Command Center (`/admin`)
- Accessible to authorized administrator roles.
- **Key Fleet Metrics**: Total Fleet Units, Pending Approvals, Confirmed Revenue, and Real-time Fleet Utilization %.
- **Reservation Workflow Operations**: One-click actions to Approve (`Confirm`), Mark Complete (`Completed`), or Reject (`Cancel`).
- **Fleet Inventory Management**: Real-time stock adjustment dialog (adjust Total Stock and Available Stock) with automated status updates.
- **Register New Hardware**: Modal to add new equipment directly into the fleet with technical specifications.

### 7. Instant Role Switcher & Authentication
- Header role pill for fast demonstration during DBMS grading:
  - **Customer (Alex)**: Regular client reserving gear and tracking manifests.
  - **Admin (Sarah)**: Equipment warehouse supervisor managing bookings and stock.
  - **Guest**: Logged-out state with sign-in and registration prompts.
- Dedicated `/login` and `/register` views with quick-fill demo buttons.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + Vite 8
- **Language**: JavaScript (ES6+ Modules)
- **Routing**: React Router v7 (`createBrowserRouter`)
- **Icons**: Lucide React
- **Linter**: Oxlint (0 warnings, 0 errors)
- **Styling**: Modular CSS + Design Tokens (`src/styles/tokens.css`, `src/styles/global.css`)
- **State & Service Layer**: Decoupled HTTP API client (`src/services/apiClient.js`) with session persistence in Mock Mode and seamless `.env` toggle for real backend integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd DBMS

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Scripts
- `npm run dev`: Launch local Vite development server with HMR.
- `npm run build`: Build production distribution in `dist/`.
- `npm run lint`: Run Oxlint across the codebase.
- `npm run preview`: Preview the production build locally.

---

## 🔌 Backend & SQL Integration

The frontend is ready to connect with your teammate's backend server and SQL database.

To switch from Mock Mode to Live Backend:
1. Copy `.env.example` to `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_USE_MOCK_DATA=false
   ```
2. See [`BACKEND_INTEGRATION_SPEC.md`](./BACKEND_INTEGRATION_SPEC.md) for full endpoint specifications, request/response formats, and recommended PostgreSQL/MySQL DDL schemas.

---

## 📁 Project Structure

```text
DBMS/
├── BACKEND_INTEGRATION_SPEC.md   # Teammate API & SQL contract
├── README.md                     # Project documentation
├── index.html                    # Root HTML entry
├── vite.config.js                # Vite build configuration
├── src/
│   ├── app/
│   │   ├── App.jsx               # Application root
│   │   └── router.jsx            # React Router route definitions
│   ├── components/
│   │   ├── equipment/            # 3D Carousel & equipment cards
│   │   ├── layout/               # Header, Footer, AppShell, Role Switcher
│   │   └── ui/                   # Button, Input, Select, Badge, Card, Modal, Spinner
│   ├── context/
│   │   └── AuthContext.jsx       # Auth provider & state management
│   ├── data/
│   │   ├── featuredEquipment.js  # 3D Hero carousel items
│   │   ├── mockBookings.js       # Initial reservations dataset
│   │   └── mockEquipment.js      # 14-item master equipment inventory
│   ├── hooks/
│   │   └── useAuth.js            # Custom auth hook
│   ├── pages/
│   │   ├── AdminDashboardPage    # Admin command center
│   │   ├── BookingDetailsPage    # Booking manifest view
│   │   ├── BookingPage           # Reservation checkout form
│   │   ├── CustomerDashboardPage # Customer reservation tracker
│   │   ├── EquipmentDetailsPage  # Equipment spec sheet & calculator
│   │   ├── EquipmentPage         # Filterable inventory catalogue
│   │   ├── Home                  # Landing page & 3D showcase
│   │   ├── LoginPage             # Sign in
│   │   ├── NotFoundPage          # 404 page
│   │   └── RegisterPage          # Account creation
│   ├── services/
│   │   ├── adminService.js       # Admin inventory & status APIs
│   │   ├── apiClient.js          # Central HTTP client & mock interceptor
│   │   ├── bookingService.js     # Reservation management APIs
│   │   └── equipmentService.js   # Equipment querying APIs
│   └── styles/
│       ├── global.css            # Base styles, typography & utility classes
│       └── tokens.css            # CSS custom properties / design tokens
```
