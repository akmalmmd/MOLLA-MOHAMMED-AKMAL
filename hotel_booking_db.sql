-- ========================================================
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
-- Indexes for Performance & Overlap Queries
-- --------------------------------------------------------
CREATE INDEX idx_bookings_dates ON bookings (room_id, booking_status, check_in, check_out);
CREATE INDEX idx_rooms_status ON rooms (status, room_type, price);

-- --------------------------------------------------------
-- Sample Data: Customers
-- Default password for sample users: password123 (hashed with bcrypt)
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
