const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post('/register',
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must contain 2 to 150 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('phone').optional({ values: 'falsy' }).isLength({ max: 20 }).withMessage('Phone number is too long.'),
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, phone } = req.body;
      const [existing] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email.toLowerCase()]);
      if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' });
      const hash = await bcrypt.hash(password, 12);
      const [result] = await pool.execute(
        'INSERT INTO customers (name,email,password,phone,role) VALUES (?,?,?,?,?)',
        [name, email.toLowerCase(), hash, phone || null, 'customer']
      );
      res.status(201).json({ message: 'Registration successful. You can now log in.', customerId: result.insertId });
    } catch (err) { next(err); }
  }
);

router.post('/login',
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validate,
  async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id,name,email,password,role,phone FROM customers WHERE email = ?',
        [req.body.email.toLowerCase()]
      );
      if (!rows.length || !(await bcrypt.compare(req.body.password, rows[0].password))) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
      }
      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({
        message: 'Login successful.',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
      });
    } catch (err) { next(err); }
  }
);

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'You can only view your own profile.' });
    const [rows] = await pool.execute('SELECT id,name,email,phone,role,created_at FROM customers WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Customer not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'You can only update your own profile.' });
    const { name, phone } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Enter a valid name.' });
    await pool.execute('UPDATE customers SET name=?, phone=? WHERE id=?', [name.trim(), phone || null, id]);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
