# AURA Event Equipment Database Setup Guide

This directory contains the database definitions for the MySQL 8.0+ backend database: **`event_equipment_db`**.

---

## 1. Prerequisites

1. **MySQL Server 8.0 or higher** installed and running on your system.
   - On Windows, verify that the `MySQL80` Windows service is running.
   - Default port is `3306`.
2. **MySQL Workbench** (recommended graphical interface) or the native `mysql` CLI client.
3. Administrative credentials (e.g. `root` username and password).

---

## 2. Option A: Setup via MySQL Workbench (GUI)

1. **Launch MySQL Workbench** and connect to your local MySQL instance (e.g. `Local instance MySQL80` at `localhost:3306`).
2. Go to **File -> Open SQL Script...** (or press `Ctrl + Shift + O`).
3. Select `backend/database/schema.sql`.
4. Click the **Execute (Lightning icon)** button to execute the schema.
   - This creates the `event_equipment_db` database and all 12 relational tables.
5. Next, open `backend/database/seeds/001_seed_categories.sql`.
6. Click **Execute** to seed the initial equipment categories (`audio`, `lighting`, `projection`, `stage`, `furniture`, `dj`, `accessories`).
7. In the left **Schemas** inspector, right-click and choose **Refresh All**. Verify `event_equipment_db` appears with all tables.

---

## 3. Option B: Setup via MySQL Command-Line Client

Open PowerShell or Command Prompt as an Administrator and execute:

```powershell
# 1. Start the MySQL service if stopped
Start-Service -Name MySQL80

# 2. Connect and execute the schema script
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend\database\schema.sql

# 3. Seed starter categories
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend\database\seeds\001_seed_categories.sql
```

*(You will be prompted to enter your MySQL root password).*

---

## 4. Verification Query

Once created, verify that the schema is intact by running:

```sql
USE event_equipment_db;
SHOW TABLES;
SELECT * FROM categories;
```

Expected output:
```text
+--------------------+
| Tables_in_event... |
+--------------------+
| booking_items      |
| bookings           |
| categories         |
| equipment          |
| event_staff        |
| events             |
| maintenance        |
| payments           |
| staff              |
| users              |
| vendors            |
| venues             |
+--------------------+
12 rows in set
```

---

## 5. Security & Design Notes

- **Password Storage**: Passwords must never be inserted as plaintext. The backend application uses `bcryptjs` with salt rounds of 10.
- **Monetary Precision**: All rental rates, subtotals, delivery fees, and taxes are declared as `DECIMAL(10, 2)` to avoid IEEE 754 floating point rounding bugs.
- **Half-Open Intervals**: Availability checks enforce half-open time intervals $[T_{\text{start}}, T_{\text{end}})$ so a booking ending at 14:00 does not block another beginning at 14:00 on the same date.
