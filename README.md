# Online Hotel Booking Management System

A full-stack hotel booking mini project using HTML, CSS, JavaScript, Node.js, Express, MySQL and MySQL Workbench.

## Features

- Customer registration and login (bcrypt password hashing, JWT authentication)
- Search rooms by dates, type, guests and price
- Room details and booking with automatic total calculation
- Booking history and customer-only cancellation
- Admin dashboard, room CRUD and booking status management
- MySQL overlap check: confirmed bookings block dates only when `existing.check_in < requested.check_out AND existing.check_out > requested.check_in`
- Exactly three main tables: `customers`, `rooms`, `bookings`
- Parameterized SQL queries and protected admin endpoints

## Requirements

- Node.js 18 or later
- MySQL Server 8.x
- MySQL Workbench (for running and inspecting SQL)

## Setup (Windows)

1. Install Node.js and MySQL Server. Open MySQL Workbench and connect to your local MySQL server.
2. Open `database/hotel_booking_db.sql` in Workbench and execute the complete script (lightning icon). Refresh Schemas and confirm `hotel_booking_db` has `customers`, `rooms`, `bookings`.
3. Open a terminal in the `backend` folder:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` in the same `backend` folder. Put your own MySQL password in `DB_PASSWORD`. Replace `JWT_SECRET` with a long random secret. Do not share or commit `.env`.
5. Create an administrator interactively:
   ```bash
   npm run create-admin
   ```
   Enter an admin name, email and password when prompted. Password is hashed; it is not stored in source code.
6. Optional sample data:
   ```bash
   npm run seed
   ```
   Sample customer accounts use password `Customer@123`:
   - `aarav@example.com`
   - `priya@example.com`
   - `rahul@example.com`
7. Start the server:
   ```bash
   npm start
   ```
8. Open `http://localhost:3000` in Chrome. The Express server serves the frontend and API from the same origin.

## Environment file

Create `backend/.env` (not `frontend/.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_MYSQL_PASSWORD
DB_NAME=hotel_booking_db
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
```

## Test the connection

- Open `http://localhost:3000/api/health`. Expected:
  `{"status":"ok","database":"connected","message":"Hotel Booking API is running."}`
- The backend terminal should print `MySQL database connected successfully.`
- In Workbench run:
  ```sql
  USE hotel_booking_db;
  SELECT * FROM customers;
  SELECT * FROM rooms;
  SELECT * FROM bookings;
  ```

## Test flow

1. Register a customer at `/register.html`, then log in.
2. Search rooms at `/rooms.html`; choose check-in and check-out dates.
3. Sign in as a customer and book a room. The system checks capacity, room maintenance status and date overlap before inserting.
4. Open `/my-bookings.html` to view or cancel your reservations.
5. Log in using the admin credentials created in step 5. Admin users are sent to `/admin.html`.
6. Add/edit/delete rooms and update booking statuses from the dashboard.

## API overview

- `POST /api/customers/register`
- `POST /api/customers/login`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `GET /api/customers/:id/bookings`
- `GET /api/rooms`, `GET /api/rooms/available`, `GET /api/rooms/:id`
- `POST /api/rooms`, `PUT /api/rooms/:id`, `DELETE /api/rooms/:id` (admin)
- `POST /api/bookings` (customer)
- `GET /api/bookings`, `PUT /api/bookings/:id/status` (admin)
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id/cancel` (customer)
- `GET /api/dashboard` (admin)
- `GET /api/health`

## Important implementation notes

- `customers.role` distinguishes `customer` and `admin` while keeping the database to exactly three tables.
- A room with booking history cannot be deleted because of the foreign key. Set its status to `Maintenance` instead.
- Availability search accepts date filters; without dates it shows rooms whose room status is `Available`.
- Booking date intervals treat check-out as exclusive, so a guest can check out on the same date another guest checks in.
- For a production deployment, add HTTPS, rate limiting, CSRF strategy if using cookies, stronger operational logging, backups and a managed secret store.
