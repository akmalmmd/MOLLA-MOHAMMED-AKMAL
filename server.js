require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/customers', require('./routes/customerBookingRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', message: 'Hotel Booking API is running.' });
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ message: 'The selected customer or room does not exist.' });
  res.status(500).json({ message: 'Server error. Check the backend terminal for details.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  console.log(`Hotel Booking System running at http://localhost:${port}`);
  try { await pool.query('SELECT 1'); console.log('MySQL database connected successfully.'); }
  catch (err) { console.error('MySQL connection failed:', err.message); }
});
