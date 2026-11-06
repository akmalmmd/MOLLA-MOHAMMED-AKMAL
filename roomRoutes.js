const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.get('/available', async (req, res, next) => {
  try {
    const { check_in, check_out, room_type, min_price, max_price, guests } = req.query;
    let sql = `SELECT r.* FROM rooms r WHERE r.status='Available'`;
    const params = [];
    if (guests) { sql += ' AND r.capacity >= ?'; params.push(Number(guests)); }
    if (room_type) { sql += ' AND r.room_type = ?'; params.push(room_type); }
    if (min_price !== undefined && min_price !== '') { sql += ' AND r.price >= ?'; params.push(Number(min_price)); }
    if (max_price !== undefined && max_price !== '') { sql += ' AND r.price <= ?'; params.push(Number(max_price)); }
    if (check_in && check_out) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(check_in) || !/^\d{4}-\d{2}-\d{2}$/.test(check_out) || check_out <= check_in) {
        return res.status(400).json({ message: 'Enter valid dates. Check-out must be after check-in.' });
      }
      sql += ` AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id AND b.booking_status = 'Confirmed'
        AND b.check_in < ? AND b.check_out > ?
      )`;
      params.push(check_out, check_in);
    }
    sql += ' ORDER BY r.price ASC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM rooms ORDER BY room_number');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM rooms WHERE id=?', [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ message: 'Room not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin,
  body('room_number').trim().notEmpty().withMessage('Room number is required.'),
  body('room_type').trim().notEmpty().withMessage('Room type is required.'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than zero.'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
  validate,
  async (req, res, next) => {
    try {
      const { room_number, room_type, description, price, capacity, image_url, status } = req.body;
      const [result] = await pool.execute(
        `INSERT INTO rooms (room_number,room_type,description,price,capacity,image_url,status)
         VALUES (?,?,?,?,?,?,?)`,
        [room_number, room_type, description || '', Number(price), Number(capacity), image_url || null, status || 'Available']
      );
      res.status(201).json({ message: 'Room added successfully.', id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That room number already exists.' });
      next(err);
    }
  }
);

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { room_number, room_type, description, price, capacity, image_url, status } = req.body;
    if (!room_number || !room_type || !Number.isFinite(Number(price)) || Number(price) <= 0 || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({ message: 'Provide valid room number, type, price and capacity.' });
    }
    if (!['Available', 'Maintenance'].includes(status)) return res.status(400).json({ message: 'Invalid room status.' });
    const [result] = await pool.execute(
      `UPDATE rooms SET room_number=?,room_type=?,description=?,price=?,capacity=?,image_url=?,status=? WHERE id=?`,
      [room_number, room_type, description || '', Number(price), Number(capacity), image_url || null, status, Number(req.params.id)]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That room number already exists.' });
    next(err);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM rooms WHERE id=?', [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'This room has booking history and cannot be deleted. Set it to Maintenance instead.' });
    next(err);
  }
});

module.exports = router;
