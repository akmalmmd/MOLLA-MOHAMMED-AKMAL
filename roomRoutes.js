const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/rooms - Get all rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM rooms ORDER BY room_number ASC');
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/available - Search available rooms
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
      query += ` AND id NOT IN (
        SELECT room_id FROM bookings
        WHERE booking_status = 'Confirmed'
        AND check_in < ? AND check_out > ?
      )`;
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
      `UPDATE rooms SET 
        room_number = COALESCE(?, room_number),
        room_type = COALESCE(?, room_type),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        capacity = COALESCE(?, capacity),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status)
       WHERE id = ?`,
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
