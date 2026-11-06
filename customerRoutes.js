const express = require('express');
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
