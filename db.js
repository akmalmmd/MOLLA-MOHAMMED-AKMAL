const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('[DB] Successfully connected to MySQL database:', process.env.DB_NAME || 'hotel_booking_db');
    connection.release();
  })
  .catch(err => {
    console.error('[DB Error] Failed to connect to MySQL:', err.message);
    console.log('[DB Tip] Verify MySQL server is running, database is created with hotel_booking_db.sql, and .env credentials match.');
  });

module.exports = pool;
