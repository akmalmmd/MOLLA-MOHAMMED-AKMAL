require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

(async () => {
  try {
    console.log('Create or update the hotel administrator account.');
    const name = (await ask('Admin name: ')).trim();
    const email = (await ask('Admin email: ')).trim().toLowerCase();
    const password = await ask('Admin password (minimum 8 characters): ');
    if (name.length < 2 || !email.includes('@') || password.length < 8) throw new Error('Enter a valid name, email and password of at least 8 characters.');
    const hash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO customers (name,email,password,role) VALUES (?,?,?,'admin')
       ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role='admin'`,
      [name, email, hash]
    );
    console.log('Admin account is ready. Keep the password private.');
  } catch (err) { console.error(err.message); process.exitCode = 1; }
  finally { rl.close(); await pool.end(); }
})();
