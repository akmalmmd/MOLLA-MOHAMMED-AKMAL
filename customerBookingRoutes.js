const express = require('express');
const pool = require('../db');
const { authenticate, requireCustomer } = require('../middleware/auth');
const router = express.Router();

router.get('/:id/bookings', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);
    if (req.user.id !== customerId) return res.status(403).json({ message: 'You can only view your own bookings.' });
    const [rows] = await pool.execute(
      `SELECT b.*, r.room_number, r.room_type, r.image_url
       FROM bookings b JOIN rooms r ON r.id=b.room_id
       WHERE b.customer_id=? ORDER BY b.created_at DESC`,
      [customerId]
    );
    res.json(rows);
  } catch (err) { next(err); }
});
module.exports = router;
