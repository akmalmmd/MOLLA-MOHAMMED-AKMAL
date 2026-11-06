const express = require('express');
const pool = require('../db');
const { authenticate, requireAdmin, requireCustomer } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireCustomer, async (req, res, next) => {
  const { room_id, check_in, check_out, guests } = req.body;
  const roomId = Number(room_id);
  const guestCount = Number(guests);
  if (!Number.isInteger(roomId) || roomId < 1 || !Number.isInteger(guestCount) || guestCount < 1 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(check_in || '') || !/^\d{4}-\d{2}-\d{2}$/.test(check_out || '') || check_out <= check_in) {
    return res.status(400).json({ message: 'Provide a room, valid dates and a valid guest count.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rooms] = await connection.execute('SELECT * FROM rooms WHERE id=? FOR UPDATE', [roomId]);
    if (!rooms.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Room not found.' });
    }
    const room = rooms[0];
    if (room.status !== 'Available') {
      await connection.rollback();
      return res.status(409).json({ message: 'This room is currently under maintenance.' });
    }
    if (guestCount > room.capacity) {
      await connection.rollback();
      return res.status(400).json({ message: `This room can accommodate up to ${room.capacity} guest(s).` });
    }
    const [conflicts] = await connection.execute(
      `SELECT id FROM bookings WHERE room_id=? AND booking_status='Confirmed'
       AND check_in < ? AND check_out > ? FOR UPDATE`,
      [roomId, check_out, check_in]
    );
    if (conflicts.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Sorry, this room has already been reserved for overlapping dates.' });
    }
    const [nightsRows] = await connection.execute('SELECT DATEDIFF(?, ?) AS nights', [check_out, check_in]);
    const nights = nightsRows[0].nights;
    if (nights < 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'Check-out must be after check-in.' });
    }
    const total = Number(room.price) * nights;
    const [result] = await connection.execute(
      `INSERT INTO bookings (customer_id,room_id,check_in,check_out,guests,total_price,booking_status)
       VALUES (?,?,?,?,?,?, 'Confirmed')`,
      [req.user.id, roomId, check_in, check_out, guestCount, total.toFixed(2)]
    );
    await connection.commit();
    res.status(201).json({ message: 'Booking confirmed successfully.', bookingId: result.insertId, total_price: total.toFixed(2), nights });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally { connection.release(); }
});

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
       r.room_number, r.room_type FROM bookings b
       JOIN customers c ON c.id=b.customer_id JOIN rooms r ON r.id=b.room_id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
       r.room_number, r.room_type, r.description, r.image_url
       FROM bookings b JOIN customers c ON c.id=b.customer_id JOIN rooms r ON r.id=b.room_id
       WHERE b.id=?`,
      [Number(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found.' });
    if (req.user.role !== 'admin' && rows[0].customer_id !== req.user.id) return res.status(403).json({ message: 'You can only view your own bookings.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id/cancel', authenticate, requireCustomer, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      `UPDATE bookings SET booking_status='Cancelled'
       WHERE id=? AND customer_id=? AND booking_status='Confirmed'`,
      [Number(req.params.id), req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Active booking not found, or it has already been cancelled.' });
    res.json({ message: 'Reservation cancelled. The room is available for those dates again.' });
  } catch (err) { next(err); }
});

router.put('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { booking_status } = req.body;
    if (!['Confirmed', 'Cancelled', 'Completed'].includes(booking_status)) {
      return res.status(400).json({ message: 'Invalid booking status.' });
    }
    if (booking_status === 'Confirmed') {
      const [current] = await pool.execute('SELECT room_id,check_in,check_out FROM bookings WHERE id=?', [Number(req.params.id)]);
      if (!current.length) return res.status(404).json({ message: 'Booking not found.' });
      const b = current[0];
      const [conflicts] = await pool.execute(
        `SELECT id FROM bookings WHERE room_id=? AND id<>? AND booking_status='Confirmed'
         AND check_in < ? AND check_out > ?`,
        [b.room_id, Number(req.params.id), b.check_out, b.check_in]
      );
      if (conflicts.length) return res.status(409).json({ message: 'Cannot confirm: another confirmed booking overlaps these dates.' });
    }
    const [result] = await pool.execute('UPDATE bookings SET booking_status=? WHERE id=?', [booking_status, Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking status updated successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
