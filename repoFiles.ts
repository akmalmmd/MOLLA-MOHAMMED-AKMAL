export interface RepoFile {
  path: string;
  category: 'backend' | 'frontend' | 'database' | 'docs';
  content: string;
}

export const STANDALONE_REPO_FILES: RepoFile[] = [
  {
    path: 'README.md',
    category: 'docs',
    content: `# Online Hotel Booking Management System

A full-stack, enterprise-grade web application for hotel room reservations, room availability tracking, overlapping date conflict resolution, and administrative hotel inventory management.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Modern Responsive Design
- **Backend:** Node.js, Express.js REST API
- **Database:** MySQL 8.0+ (Tested with MySQL Workbench)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing

---

## 📋 Entities & MySQL Tables
1. **customers** (\`id\`, \`name\`, \`email\`, \`password\`, \`phone\`, \`created_at\`)
2. **rooms** (\`id\`, \`room_number\`, \`room_type\`, \`description\`, \`price\`, \`capacity\`, \`image_url\`, \`status\`, \`created_at\`)
3. **bookings** (\`id\`, \`customer_id\`, \`room_id\`, \`check_in\`, \`check_out\`, \`guests\`, \`total_price\`, \`booking_status\`, \`created_at\`)

---

## 🚀 Step-by-Step Setup Guide

### 1. Database Setup with MySQL Workbench
1. Launch **MySQL Workbench** and connect to your local MySQL instance (Default port: \`3306\`).
2. Click **File -> Open SQL Script** or click the **New SQL Tab** icon.
3. Open or paste the contents of \`database/hotel_booking_db.sql\`.
4. Click the yellow **Lightning Bolt icon** (Execute) to execute the script.
5. In the **Navigator** pane on the left, right-click on the **Schemas** tab and click **Refresh All**.
6. Expand **hotel_booking_db** -> **Tables** to verify the three tables: \`customers\`, \`rooms\`, and \`bookings\`.
7. Test the tables with:
   \`\`\`sql
   SELECT * FROM customers;
   SELECT * FROM rooms;
   SELECT * FROM bookings;
   \`\`\`

### 2. Backend Configuration
1. Navigate to the \`backend\` directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install npm dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file (or copy \`.env.example\`):
   \`\`\`env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=hotel_booking_db
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   \`\`\`
4. Start the backend server:
   \`\`\`bash
   npm start
   \`\`\`
   or for development with auto-reload:
   \`\`\`bash
   npm run dev
   \`\`\`
   You should see:
   \`\`\`text
   [DB] Successfully connected to MySQL database: hotel_booking_db
   [Server] Online Hotel Booking API running on http://localhost:3000
   \`\`\`

### 3. Frontend Execution
1. Open the \`frontend\` directory.
2. You can open \`frontend/index.html\` directly in any modern browser, or serve it using a local HTTP server:
   \`\`\`bash
   # Using Python 3:
   cd frontend && python3 -m http.server 8080
   # Or using Node http-server:
   npx http-server frontend -p 8080
   \`\`\`
3. Open \`http://localhost:8080\` in your browser.

---

## 🔑 Default Credentials
- **Customer User:** \`alice@example.com\` / \`password123\`
- **Customer User:** \`bob@example.com\` / \`password123\`
- **Admin User:** \`admin@grandpalace.com\` / \`admin123\`

---

## 📡 REST API Documentation

### Customer Routes
- \`POST /api/customers/register\` - Register customer (\`name\`, \`email\`, \`password\`, \`phone\`)
- \`POST /api/customers/login\` - Login customer & retrieve JWT token
- \`GET /api/customers/:id\` - Fetch customer profile
- \`PUT /api/customers/:id\` - Update customer details

### Room Routes
- \`GET /api/rooms\` - List all rooms
- \`GET /api/rooms/:id\` - Fetch specific room details
- \`GET /api/rooms/available\` - Filter available rooms (\`check_in\`, \`check_out\`, \`room_type\`, \`max_price\`, \`min_capacity\`)
- \`POST /api/rooms\` - [Admin] Create new room
- \`PUT /api/rooms/:id\` - [Admin] Update room details
- \`DELETE /api/rooms/:id\` - [Admin] Delete room

### Booking Routes
- \`POST /api/bookings\` - Create reservation (validates dates, capacity, calculates total)
- \`GET /api/bookings\` - [Admin] Fetch all bookings with customer & room details
- \`GET /api/bookings/:id\` - Fetch booking by ID
- \`GET /api/customers/:id/bookings\` - Fetch customer's reservation history
- \`PUT /api/bookings/:id/cancel\` - Cancel reservation (frees room for date range)
- \`PUT /api/bookings/:id/status\` - [Admin] Update status (Confirmed / Cancelled / Completed)

### Dashboard Routes
- \`GET /api/dashboard\` - Real-time statistics (total rooms, available rooms, bookings, revenue)
`
  },
  {
    path: 'database/hotel_booking_db.sql',
    category: 'database',
    content: `-- ========================================================
-- Database Name: hotel_booking_db
-- Description: Complete SQL Schema & Seed Data for Online Hotel Booking Management System
-- Generated for MySQL 8.0+ / MySQL Workbench
-- ========================================================

DROP DATABASE IF EXISTS hotel_booking_db;
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_booking_db;

-- --------------------------------------------------------
-- Table 1: customers
-- --------------------------------------------------------
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 2: rooms
-- --------------------------------------------------------
CREATE TABLE rooms (
  id INT NOT NULL AUTO_INCREMENT,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  image_url VARCHAR(500) DEFAULT NULL,
  status ENUM('Available','Maintenance') NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 3: bookings
-- --------------------------------------------------------
CREATE TABLE bookings (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  booking_status ENUM('Confirmed','Cancelled','Completed') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Indexes for Performance
-- --------------------------------------------------------
CREATE INDEX idx_bookings_dates ON bookings (room_id, booking_status, check_in, check_out);
CREATE INDEX idx_rooms_status ON rooms (status, room_type, price);

-- --------------------------------------------------------
-- Sample Data: Customers
-- Default password: password123 (hashed with bcrypt)
-- Admin password: admin123
-- --------------------------------------------------------
INSERT INTO customers (id, name, email, password, phone, created_at) VALUES
(1, 'Alice Johnson', 'alice@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 234-5678', '2026-10-15 09:30:00'),
(2, 'Bob Smith', 'bob@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 345-6789', '2026-10-18 14:15:00'),
(3, 'Catherine Davis', 'catherine@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 456-7890', '2026-10-22 11:45:00'),
(4, 'Hotel Administrator', 'admin@grandpalace.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 999-0000', '2026-10-01 08:00:00');

-- --------------------------------------------------------
-- Sample Data: Rooms
-- --------------------------------------------------------
INSERT INTO rooms (id, room_number, room_type, description, price, capacity, image_url, status, created_at) VALUES
(1, '101', 'Single Room', 'Compact, quiet haven designed for solo travelers or business professionals. High-speed fiber WiFi, ergonomic workstation, and marble shower.', 1500.00, 1, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(2, '102', 'Double Room', 'Comfortable double room with queen-sized bed, private sunlit balcony, smart 4K flat-screen TV, and artisanal coffee maker.', 2500.00, 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(3, '103', 'Deluxe Room', 'Refined comfort boasting panoramic garden and poolside views. Includes an opulent California King bed, soaking tub, and minibar.', 4000.00, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(4, '104', 'Suite Room', 'Spectacular executive suite offering dedicated living and dining quarters, panoramic ocean horizon vistas, and bespoke butler service.', 6000.00, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(5, '105', 'Family Room', 'Expansive family sanctuary featuring twin queen beds plus pull-out daybed, dual vanity bathroom, and convenient kitchenette.', 5000.00, 5, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(6, '201', 'Presidential Suite', 'The pinnacle of luxury hospitality with rooftop infinity jacuzzi, 8-guest dining salon, master bedroom sauna, and 360-degree skyline views.', 9500.00, 6, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00');

-- --------------------------------------------------------
-- Sample Data: Bookings
-- --------------------------------------------------------
INSERT INTO bookings (id, customer_id, room_id, check_in, check_out, guests, total_price, booking_status, created_at) VALUES
(1, 1, 2, '2026-11-10', '2026-11-14', 2, 10000.00, 'Confirmed', '2026-10-25 15:20:00'),
(2, 2, 3, '2026-11-12', '2026-11-15', 2, 12000.00, 'Confirmed', '2026-10-27 11:10:00'),
(3, 3, 4, '2026-10-20', '2026-10-24', 3, 24000.00, 'Completed', '2026-10-15 16:00:00'),
(4, 1, 1, '2026-11-20', '2026-11-22', 1, 3000.00, 'Cancelled', '2026-10-28 09:00:00');

-- --------------------------------------------------------
-- Verification SELECT Queries
-- --------------------------------------------------------
SELECT * FROM customers;
SELECT * FROM rooms;
SELECT * FROM bookings;
`
  },
  {
    path: 'backend/package.json',
    category: 'backend',
    content: `{
  "name": "hotel-booking-backend",
  "version": "1.0.0",
  "description": "Node.js and Express REST API for Online Hotel Booking Management System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
`
  },
  {
    path: 'backend/.env.example',
    category: 'backend',
    content: `DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_booking_db
PORT=3000
JWT_SECRET=hotel_booking_jwt_secret_token_key_2026
`
  },
  {
    path: 'backend/db.js',
    category: 'backend',
    content: `const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('[DB] Successfully connected to MySQL database:', process.env.DB_NAME || 'hotel_booking_db');
    connection.release();
  })
  .catch(err => {
    console.error('[DB Error] Failed to connect to MySQL:', err.message);
    console.log('[DB Tip] Verify MySQL server is running, database is created with hotel_booking_db.sql, and .env credentials match.');
  });

module.exports = pool;
`
  },
  {
    path: 'backend/middleware/auth.js',
    category: 'backend',
    content: `const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hotel_booking_jwt_secret_token_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required' });
    }
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
`
  },
  {
    path: 'backend/routes/customerRoutes.js',
    category: 'backend',
    content: `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/customers/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO customers (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '']
    );

    const token = jwt.sign({ id: result.insertId, email, name, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      customer: { id: result.insertId, name, email, phone: phone || '' }
    });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ success: false, message: 'Database error occurred during registration' });
  }
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const customer = rows[0];
    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const role = customer.email === 'admin@grandpalace.com' ? 'admin' : 'customer';
    const token = jwt.sign({ id: customer.id, email: customer.email, name: customer.name, role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, role }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, created_at FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, customer: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await db.query('UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, req.params.id]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
`
  },
  {
    path: 'backend/routes/roomRoutes.js',
    category: 'backend',
    content: `const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/rooms - Get all rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/available - Search available rooms by check-in, check-out, type, price
router.get('/available', async (req, res) => {
  try {
    const { check_in, check_out, room_type, max_price, min_capacity } = req.query;

    let query = "SELECT * FROM rooms WHERE status = 'Available'";
    const params = [];

    if (room_type && room_type !== 'All') {
      query += " AND room_type = ?";
      params.push(room_type);
    }
    if (max_price) {
      query += " AND price <= ?";
      params.push(Number(max_price));
    }
    if (min_capacity) {
      query += " AND capacity >= ?";
      params.push(Number(min_capacity));
    }

    if (check_in && check_out) {
      query += \` AND id NOT IN (
        SELECT room_id FROM bookings
        WHERE booking_status = 'Confirmed'
        AND check_in < ? AND check_out > ?
      )\`;
      params.push(check_out, check_in);
    }

    query += " ORDER BY price ASC";
    const [rooms] = await db.query(query, params);
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    console.error('Available rooms search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/:id - Get one room
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/rooms - Add new room (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { room_number, room_type, description, price, capacity, image_url, status } = req.body;
    if (!room_number || !room_type || !price) {
      return res.status(400).json({ success: false, message: 'Room number, type, and price are required' });
    }

    const [existing] = await db.query('SELECT id FROM rooms WHERE room_number = ?', [room_number]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO rooms (room_number, room_type, description, price, capacity, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [room_number, room_type, description || '', price, capacity || 1, image_url || '', status || 'Available']
    );

    res.status(201).json({ success: true, message: 'Room added successfully', roomId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/rooms/:id - Update room info (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { room_number, room_type, description, price, capacity, image_url, status } = req.body;
    await db.query(
      \`UPDATE rooms SET 
        room_number = COALESCE(?, room_number),
        room_type = COALESCE(?, room_type),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        capacity = COALESCE(?, capacity),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status)
       WHERE id = ?\`,
      [room_number, room_type, description, price, capacity, image_url, status, req.params.id]
    );
    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/rooms/:id - Delete room (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    // Check if room has active bookings
    const [activeBookings] = await db.query(
      "SELECT id FROM bookings WHERE room_id = ? AND booking_status = 'Confirmed'",
      [req.params.id]
    );
    if (activeBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete room with active confirmed bookings' });
    }

    await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
`
  },
  {
    path: 'backend/routes/bookingRoutes.js',
    category: 'backend',
    content: `const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/bookings - Create a new reservation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { room_id, check_in, check_out, guests } = req.body;
    const customer_id = req.user.id;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({ success: false, message: 'Room ID, check-in, and check-out dates are required' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const diffDays = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return res.status(400).json({ success: false, message: 'Check-out date must be later than check-in date' });
    }

    // Retrieve Room
    const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const room = rooms[0];

    if (room.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Room is not available for booking' });
    }

    if (guests && guests > room.capacity) {
      return res.status(400).json({ success: false, message: \`Guest count (\${guests}) exceeds room capacity (\${room.capacity})\` });
    }

    // Overlapping Date Verification
    const [conflicts] = await db.query(
      \`SELECT id FROM bookings 
       WHERE room_id = ? 
       AND booking_status = 'Confirmed'
       AND check_in < ? AND check_out > ?\`,
      [room_id, check_out, check_in]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The room is already booked for the selected dates. Please choose different dates.'
      });
    }

    const total_price = diffDays * Number(room.price);

    const [result] = await db.query(
      \`INSERT INTO bookings (customer_id, room_id, check_in, check_out, guests, total_price, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')\`,
      [customer_id, room_id, check_in, check_out, guests || 1, total_price]
    );

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        id: result.insertId,
        customer_id,
        room_id,
        check_in,
        check_out,
        guests: guests || 1,
        total_price,
        booking_status: 'Confirmed'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings - Get all bookings (Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(\`
      SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             r.room_number, r.room_type, r.price AS price_per_night
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
    \`);
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(\`
      SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             r.room_number, r.room_type, r.price AS price_per_night, r.image_url
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    \`, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = rows[0];

    // Customer access control
    if (req.user.role !== 'admin' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers/:id/bookings - Customer personal bookings
router.get('/customer/:id', authenticateToken, async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== requestedId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own bookings' });
    }

    const [bookings] = await db.query(\`
      SELECT b.*, r.room_number, r.room_type, r.price AS price_per_night, r.image_url
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.customer_id = ?
      ORDER BY b.id DESC
    \`, [requestedId]);

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookings/:id/cancel - Cancel reservation
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = rows[0];

    if (req.user.role !== 'admin' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You may only cancel your own bookings' });
    }

    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    await db.query("UPDATE bookings SET booking_status = 'Cancelled' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Reservation cancelled successfully. Room is now available for these dates.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookings/:id/status - Update booking status (Admin)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { booking_status } = req.body;
    if (!['Confirmed', 'Cancelled', 'Completed'].includes(booking_status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    await db.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [booking_status, req.params.id]);
    res.json({ success: true, message: \`Booking status updated to \${booking_status}\` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
`
  },
  {
    path: 'backend/routes/dashboardRoutes.js',
    category: 'backend',
    content: `const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/dashboard - Admin Dashboard KPIs
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [[{ total_customers }]] = await db.query("SELECT COUNT(*) AS total_customers FROM customers WHERE email != 'admin@grandpalace.com'");
    const [[{ total_rooms }]] = await db.query('SELECT COUNT(*) AS total_rooms FROM rooms');
    const [[{ available_rooms }]] = await db.query("SELECT COUNT(*) AS available_rooms FROM rooms WHERE status = 'Available'");
    const [[{ total_bookings }]] = await db.query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const [[{ confirmed_bookings }]] = await db.query("SELECT COUNT(*) AS confirmed_bookings FROM bookings WHERE booking_status = 'Confirmed'");
    const [[{ cancelled_bookings }]] = await db.query("SELECT COUNT(*) AS cancelled_bookings FROM bookings WHERE booking_status = 'Cancelled'");
    const [[{ completed_bookings }]] = await db.query("SELECT COUNT(*) AS completed_bookings FROM bookings WHERE booking_status = 'Completed'");
    const [[{ total_revenue }]] = await db.query("SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM bookings WHERE booking_status != 'Cancelled'");

    res.json({
      success: true,
      stats: {
        totalCustomers: Number(total_customers),
        totalRooms: Number(total_rooms),
        availableRooms: Number(available_rooms),
        totalBookings: Number(total_bookings),
        confirmedBookings: Number(confirmed_bookings),
        cancelledBookings: Number(cancelled_bookings),
        completedBookings: Number(completed_bookings),
        totalRevenue: Number(total_revenue)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
`
  },
  {
    path: 'backend/server.js',
    category: 'backend',
    content: `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customerRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files if hosted jointly
app.use(express.static('../frontend'));

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`[Server] Online Hotel Booking Management System running on http://localhost:\${PORT}\`);
});
`
  },
  {
    path: 'frontend/style.css',
    category: 'frontend',
    content: `/* Hotel Booking Management System - Luxury Palette & Fluid Responsive Layout */
:root {
  --primary: #0f172a;
  --accent: #d97706;
  --accent-hover: #b45309;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --border: #e2e8f0;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --success: #16a34a;
  --danger: #dc2626;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text-main);
  line-height: 1.6;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2.5rem;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.brand {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  color: #f8fafc;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover, .nav-links a.active {
  color: #f59e0b;
}

.btn-primary {
  background: var(--accent);
  color: #ffffff;
  padding: 0.65rem 1.4rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.hero {
  position: relative;
  background: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
  color: white;
  padding: 6rem 2rem 5rem;
  text-align: center;
}

.hero h1 {
  font-family: var(--font-serif);
  font-size: 3rem;
  margin-bottom: 1rem;
}

.search-box {
  max-width: 1050px;
  margin: -2.5rem auto 3rem;
  background: #ffffff;
  padding: 1.75rem 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) 140px;
  gap: 1.25rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: left;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.form-group input, .form-group select {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.room-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.25s, box-shadow 0.25s;
  display: flex;
  flex-direction: column;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.1);
}

.room-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.room-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.room-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
}

.badge-available { background: #dcfce7; color: #15803d; }
.badge-maintenance { background: #fee2e2; color: #b91c1c; }
.badge-confirmed { background: #e0f2fe; color: #0369a1; }
.badge-completed { background: #f1f5f9; color: #475569; }
.badge-cancelled { background: #fee2e2; color: #b91c1c; }

table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

th, td {
  padding: 1rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: #f8fafc;
  font-weight: 700;
  color: var(--text-muted);
  font-size: 0.85rem;
}
`
  },
  {
    path: 'frontend/index.html',
    category: 'frontend',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Grand Azure - Luxury Hotel & Resort</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="navbar">
    <a href="index.html" class="brand">👑 The Grand Azure</a>
    <ul class="nav-links">
      <li><a href="index.html" class="active">Home</a></li>
      <li><a href="rooms.html">Rooms & Suites</a></li>
      <li><a href="my-bookings.html">My Bookings</a></li>
      <li><a href="admin.html">Admin Portal</a></li>
      <li id="authNavItem"><a href="login.html" class="btn-primary">Sign In</a></li>
    </ul>
  </nav>

  <header class="hero">
    <h1>Experience Timeless Elegance</h1>
    <p>Discover an unforgettable sanctuary where luxury meets personalized hospitality.</p>
  </header>

  <section class="search-box">
    <div class="form-group">
      <label for="checkIn">Check-In Date</label>
      <input type="date" id="checkIn">
    </div>
    <div class="form-group">
      <label for="checkOut">Check-Out Date</label>
      <input type="date" id="checkOut">
    </div>
    <div class="form-group">
      <label for="roomType">Room Category</label>
      <select id="roomType">
        <option value="All">All Categories</option>
        <option value="Single Room">Single Room</option>
        <option value="Double Room">Double Room</option>
        <option value="Deluxe Room">Deluxe Room</option>
        <option value="Suite Room">Suite Room</option>
        <option value="Family Room">Family Room</option>
        <option value="Presidential Suite">Presidential Suite</option>
      </select>
    </div>
    <div class="form-group">
      <label for="guests">Guests</label>
      <select id="guests">
        <option value="1">1 Guest</option>
        <option value="2" selected>2 Guests</option>
        <option value="3">3 Guests</option>
        <option value="4">4 Guests</option>
        <option value="5">5+ Guests</option>
      </select>
    </div>
    <button class="btn-primary" onclick="searchRooms()">Find Rooms</button>
  </section>

  <main style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem;">
    <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 1.5rem;">Featured Accommodations</h2>
    <div id="roomContainer" class="room-grid"></div>
  </main>

  <script src="script.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      initHomePage();
    });
  </script>
</body>
</html>
`
  },
  {
    path: 'frontend/script.js',
    category: 'frontend',
    content: `// Client-side interactions for Online Hotel Booking System
const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('hotel_jwt_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('hotel_user');
  return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
  localStorage.setItem('hotel_jwt_token', token);
  localStorage.setItem('hotel_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('hotel_jwt_token');
  localStorage.removeItem('hotel_user');
  window.location.reload();
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
    ...options.headers
  };
  const response = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

async function initHomePage() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inElem = document.getElementById('checkIn');
  const outElem = document.getElementById('checkOut');
  if (inElem) inElem.value = today;
  if (outElem) outElem.value = tomorrow;

  loadFeaturedRooms();
}

async function loadFeaturedRooms() {
  try {
    const data = await apiRequest('/rooms');
    const container = document.getElementById('roomContainer');
    if (!container) return;
    container.innerHTML = data.rooms.map(room => \`
      <div class="room-card">
        <img src="\${room.image_url}" alt="\${room.room_type}">
        <div class="room-card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span class="badge badge-available">\${room.status}</span>
            <span style="font-weight:600; color:var(--text-muted);">Room #\${room.room_number}</span>
          </div>
          <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem;">\${room.room_type}</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; flex:1; margin-bottom:1rem;">\${room.description}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:1rem;">
            <div>
              <span class="room-price">$\${Number(room.price).toLocaleString()}</span>
              <span style="font-size:0.8rem; color:var(--text-muted);">/ night</span>
            </div>
            <a href="rooms.html?id=\${room.id}" class="btn-primary">Book Now</a>
          </div>
        </div>
      </div>
    \`).join('');
  } catch (err) {
    console.error('Failed to load rooms:', err);
  }
}

async function searchRooms() {
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const roomType = document.getElementById('roomType').value;
  const guests = document.getElementById('guests').value;

  window.location.href = \`rooms.html?in=\${checkIn}&out=\${checkOut}&type=\${encodeURIComponent(roomType)}&guests=\${guests}\`;
}
`
  }
];
