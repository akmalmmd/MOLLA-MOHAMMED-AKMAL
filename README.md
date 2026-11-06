# 🏨 Online Hotel Booking Management System

A full-stack, enterprise-grade web application for hotel reservations, real-time room availability calculation, overlapping date conflict protection, and administrative hotel inventory management.

---

## 🛠️ Technologies Used

### Frontend
- **HTML5:** Semantic, accessible markup
- **CSS3:** Modern design system, responsive grid/flexbox layouts, hotel aesthetics
- **JavaScript (ES6+):** Async/await REST API integrations, dynamic DOM manipulation

### Backend
- **Node.js & Express.js:** Fast, modular REST API architecture
- **JWT (JSON Web Tokens):** Secure stateless authentication
- **bcryptjs:** High-entropy password hashing with salt rounds

### Database
- **MySQL 8.0+ / MySQL Workbench:** Relational schema with primary keys, foreign key constraints, and performance indexes

---

## 📋 Entities & MySQL Tables

The system strictly utilizes three relational entities:

### 1. `customers`
| Column | Type | Constraints / Description |
|---|---|---|
| \`id\` | INT | PRIMARY KEY, AUTO_INCREMENT |
| \`name\` | VARCHAR(150) | NOT NULL, Full customer name |
| \`email\` | VARCHAR(150) | NOT NULL, UNIQUE, Login identifier |
| \`password\` | VARCHAR(255) | NOT NULL, bcrypt hashed secret |
| \`phone\` | VARCHAR(20) | Customer contact telephone |
| \`created_at\` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 2. `rooms`
| Column | Type | Constraints / Description |
|---|---|---|
| \`id\` | INT | PRIMARY KEY, AUTO_INCREMENT |
| \`room_number\` | VARCHAR(20) | NOT NULL, UNIQUE, E.g. "101", "102" |
| \`room_type\` | VARCHAR(100) | NOT NULL, Single / Double / Deluxe / Suite / Family |
| \`description\` | TEXT | Room amenities & details |
| \`price\` | DECIMAL(10,2) | NOT NULL, Nightly rate |
| \`capacity\` | INT | NOT NULL, Maximum guests accommodated |
| \`image_url\` | VARCHAR(500) | URL to room photo |
| \`status\` | ENUM | 'Available' or 'Maintenance' |
| \`created_at\` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### 3. `bookings`
| Column | Type | Constraints / Description |
|---|---|---|
| \`id\` | INT | PRIMARY KEY, AUTO_INCREMENT |
| \`customer_id\` | INT | FOREIGN KEY REFERENCES customers(id) |
| \`room_id\` | INT | FOREIGN KEY REFERENCES rooms(id) |
| \`check_in\` | DATE | NOT NULL, Reservation arrival date |
| \`check_out\` | DATE | NOT NULL, Reservation departure date |
| \`guests\` | INT | Number of occupants |
| \`total_price\` | DECIMAL(10,2) | Calculated as (nights * price_per_night) |
| \`booking_status\` | ENUM | 'Confirmed', 'Cancelled', 'Completed' |
| \`created_at\` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## 💻 MySQL Workbench Step-by-Step Instructions

1. **Launch MySQL Workbench**:
   - Open MySQL Workbench on your computer.
2. **Connect to Local MySQL Instance**:
   - Click on your local MySQL connection (usually `Local instance 3306` with user `root`).
   - Enter your MySQL root password when prompted.
3. **Open SQL Script**:
   - In MySQL Workbench, click **File -> Open SQL Script...** (or press \`Ctrl+Shift+O\` / \`Cmd+Shift+O\`).
   - Select the file located at: `database/hotel_booking_db.sql`.
4. **Execute the Database & Table Creation**:
   - Click the yellow **Lightning Bolt** execution icon on the SQL query toolbar.
   - The query execution output will display green checkmarks for table creation and sample data insertion.
5. **Verify Schemas in Workbench**:
   - In the left sidebar navigator, select the **Schemas** tab.
   - Right-click in the empty space and choose **Refresh All**.
   - Expand `hotel_booking_db` -> **Tables**.
   - You will see:
     - `customers`
     - `rooms`
     - `bookings`
6. **Inspect Records**:
   - Open a new query tab and execute:
     ```sql
     USE hotel_booking_db;
     SELECT * FROM customers;
     SELECT * FROM rooms;
     SELECT * FROM bookings;
     ```

---

## 🚀 Running the Project

### Standalone Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm start
```

### Standalone Frontend
Open `frontend/index.html` in your web browser or serve via any static server:
```bash
npx serve frontend -l 8080
```

---

## 🔑 Default Test Accounts
| Role | Email | Password |
|---|---|---|
| Customer | alice@example.com | password123 |
| Customer | bob@example.com | password123 |
| Admin | admin@grandpalace.com | admin123 |

---

## 🛡️ Overlapping Booking Prevention Logic
Two dates `[check_in, check_out]` and `[requested_in, requested_out]` overlap when:
```sql
requested_in < existing_check_out AND requested_out > existing_check_in
```
When a room has a reservation with status `Confirmed` for those dates, the booking is rejected. Cancelled bookings do not block room availability.
