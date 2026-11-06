const express = require('express');
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
      return res.status(400).json({ success: false, message: `Guest count (${guests}) exceeds room capacity (${room.capacity})` });
    }

    // Overlapping Date Verification
    const [conflicts] = await db.query(
      `SELECT id FROM bookings 
       WHERE room_id = ? 
       AND booking_status = 'Confirmed'
       AND check_in < ? AND check_out > ?`,
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
      `INSERT INTO bookings (customer_id, room_id, check_in, check_out, guests, total_price, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`,
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
    const [bookings] = await db.query(`
      SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             r.room_number, r.room_type, r.price AS price_per_night
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
    `);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             r.room_number, r.room_type, r.price AS price_per_night, r.image_url
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `, [req.params.id]);

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

    const [bookings] = await db.query(`
      SELECT b.*, r.room_number, r.room_type, r.price AS price_per_night, r.image_url
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.customer_id = ?
      ORDER BY b.id DESC
    `, [requestedId]);

    res.json({ success: true, count: bookings.length, bookings });
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
    res.json({ success: true, message: `Booking status updated to ${booking_status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
