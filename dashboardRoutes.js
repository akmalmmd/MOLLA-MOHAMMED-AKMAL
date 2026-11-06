const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [customers] = await pool.execute("SELECT COUNT(*) AS total FROM customers WHERE role='customer'");
    const [rooms] = await pool.execute('SELECT COUNT(*) AS total FROM rooms');
    const [available] = await pool.execute("SELECT COUNT(*) AS total FROM rooms WHERE status='Available'");
    const [bookings] = await pool.execute('SELECT COUNT(*) AS total FROM bookings');
    const [confirmed] = await pool.execute("SELECT COUNT(*) AS total FROM bookings WHERE booking_status='Confirmed'");
    const [cancelled] = await pool.execute("SELECT COUNT(*) AS total FROM bookings WHERE booking_status='Cancelled'");
    res.json({
      totalCustomers: customers[0].total,
      totalRooms: rooms[0].total,
      availableRooms: available[0].total,
      totalBookings: bookings[0].total,
      confirmedBookings: confirmed[0].total,
      cancelledBookings: cancelled[0].total
    });
  } catch (err) { next(err); }
});
module.exports = router;
