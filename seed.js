require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

(async () => {
  try {
    const hash = await bcrypt.hash('Customer@123', 12);
    const customers = [
      ['Aarav Kumar', 'aarav@example.com', hash, '9876500001', 'customer'],
      ['Priya Sharma', 'priya@example.com', hash, '9876500002', 'customer'],
      ['Rahul Reddy', 'rahul@example.com', hash, '9876500003', 'customer']
    ];
    for (const c of customers) {
      await pool.execute(
        `INSERT INTO customers (name,email,password,phone,role) VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone)`,
        c
      );
    }
    const rooms = [
      ['101','Single Room','Comfortable room for one guest.',1500,1,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900','Available'],
      ['102','Double Room','A bright room with a comfortable double bed.',2500,2,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900','Available'],
      ['103','Deluxe Room','Spacious deluxe room with premium amenities.',4000,2,'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900','Available'],
      ['104','Suite Room','Luxury suite with separate living space.',6000,4,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900','Available'],
      ['105','Family Room','Large room ideal for a family stay.',5000,5,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900','Available']
    ];
    for (const r of rooms) {
      await pool.execute(
        `INSERT INTO rooms (room_number,room_type,description,price,capacity,image_url,status)
         VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE room_type=VALUES(room_type),description=VALUES(description),
         price=VALUES(price),capacity=VALUES(capacity),image_url=VALUES(image_url),status=VALUES(status)`, r
      );
    }
    const [[a]] = await pool.execute("SELECT id FROM customers WHERE email='aarav@example.com'");
    const [[p]] = await pool.execute("SELECT id FROM customers WHERE email='priya@example.com'");
    const [[r101]] = await pool.execute("SELECT id FROM rooms WHERE room_number='101'");
    const [[r102]] = await pool.execute("SELECT id FROM rooms WHERE room_number='102'");
    const [[r103]] = await pool.execute("SELECT id FROM rooms WHERE room_number='103'");
    const samples = [
      [a.id,r101.id,'2027-01-10','2027-01-12',1,3000,'Confirmed'],
      [p.id,r102.id,'2027-01-10','2027-01-13',2,7500,'Confirmed'],
      [a.id,r103.id,'2027-01-15','2027-01-17',2,8000,'Cancelled']
    ];
    for (const b of samples) {
      const [found] = await pool.execute(
        `SELECT id FROM bookings WHERE customer_id=? AND room_id=? AND check_in=? AND check_out=?`,
        b.slice(0,4)
      );
      if (!found.length) await pool.execute(
        `INSERT INTO bookings (customer_id,room_id,check_in,check_out,guests,total_price,booking_status)
         VALUES (?,?,?,?,?,?,?)`, b
      );
    }
    console.log('Sample data inserted/updated.');
    console.log('Sample customer login: aarav@example.com / Customer@123');
    console.log('Sample customer login: priya@example.com / Customer@123');
  } catch (err) { console.error(err); process.exitCode = 1; }
  finally { await pool.end(); }
})();
