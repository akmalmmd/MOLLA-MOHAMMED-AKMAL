const express = require('express');
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
