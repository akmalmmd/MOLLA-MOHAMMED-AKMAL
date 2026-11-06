import bcrypt from 'bcryptjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  created_at: string;
}

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  description: string;
  price: number;
  capacity: number;
  image_url: string;
  status: 'Available' | 'Maintenance';
  created_at: string;
}

export interface Booking {
  id: number;
  customer_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  booking_status: 'Confirmed' | 'Cancelled' | 'Completed';
  created_at: string;
}

export interface SQLLogEntry {
  id: string;
  timestamp: string;
  query: string;
  params?: any[];
  executionTimeMs: number;
  affectedRows?: number;
}

class DatabaseService {
  private customers: Customer[] = [];
  private rooms: Room[] = [];
  private bookings: Booking[] = [];
  private nextCustomerId = 1;
  private nextRoomId = 1;
  private nextBookingId = 1;
  private queryLogs: SQLLogEntry[] = [];
  private isConnectedToMySQL = false;
  private mysqlPool: any = null;

  constructor() {
    this.seedInitialData();
  }

  private logQuery(query: string, params: any[] = [], affectedRows: number = 0, startTime = Date.now()) {
    const entry: SQLLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      query: query.trim(),
      params: params.length > 0 ? params : undefined,
      executionTimeMs: Math.max(1, Date.now() - startTime),
      affectedRows,
    };
    this.queryLogs.unshift(entry);
    if (this.queryLogs.length > 100) {
      this.queryLogs.pop();
    }
  }

  public getQueryLogs(): SQLLogEntry[] {
    return this.queryLogs;
  }

  public isMySQL(): boolean {
    return this.isConnectedToMySQL;
  }

  private async seedInitialData() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashed = await bcrypt.hash('admin123', 10);

    // Initial Customers
    this.customers = [
      {
        id: this.nextCustomerId++,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        phone: '+1 (555) 234-5678',
        created_at: '2026-10-15 09:30:00',
      },
      {
        id: this.nextCustomerId++,
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: hashedPassword,
        phone: '+1 (555) 345-6789',
        created_at: '2026-10-18 14:15:00',
      },
      {
        id: this.nextCustomerId++,
        name: 'Catherine Davis',
        email: 'catherine@example.com',
        password: hashedPassword,
        phone: '+1 (555) 456-7890',
        created_at: '2026-10-22 11:45:00',
      },
      {
        id: this.nextCustomerId++,
        name: 'Hotel Administrator',
        email: 'admin@grandpalace.com',
        password: adminHashed,
        phone: '+1 (555) 999-0000',
        created_at: '2026-10-01 08:00:00',
      },
    ];

    // Initial Rooms with diverse prices, capacities, and high-quality visuals
    this.rooms = [
      {
        id: this.nextRoomId++,
        room_number: '101',
        room_type: 'Single Room',
        description: 'Compact, quiet haven designed for solo travelers or business professionals. Features high-speed fiber WiFi, ergonomic work station, plush single pillowtop mattress, and en-suite rainfall shower.',
        price: 1500.0,
        capacity: 1,
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
      {
        id: this.nextRoomId++,
        room_number: '102',
        room_type: 'Double Room',
        description: 'Comfortable double room with a queen-sized posturepedic bed, private sunlit balcony, smart 4K flat-screen TV, artisanal coffee maker, and bespoke bath toiletries.',
        price: 2500.0,
        capacity: 2,
        image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
      {
        id: this.nextRoomId++,
        room_number: '103',
        room_type: 'Deluxe Room',
        description: 'Refined comfort boasting panoramic garden and poolside views. Includes an opulent California King bed, marble deep-soaking bathtub, lounge armchairs, and complimentary evening minibar.',
        price: 4000.0,
        capacity: 2,
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
      {
        id: this.nextRoomId++,
        room_number: '104',
        room_type: 'Suite Room',
        description: 'Spectacular executive suite offering dedicated living and dining quarters, panoramic ocean horizon vistas, customized sound system, and personalized butler concierge service.',
        price: 6000.0,
        capacity: 4,
        image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
      {
        id: this.nextRoomId++,
        room_number: '105',
        room_type: 'Family Room',
        description: 'Expansive family sanctuary featuring twin queen beds plus an additional pull-out daybed, dual vanity bathroom, interactive entertainment hub, and kitchenette with microwave.',
        price: 5000.0,
        capacity: 5,
        image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
      {
        id: this.nextRoomId++,
        room_number: '201',
        room_type: 'Presidential Suite',
        description: 'The pinnacle of luxury hospitality. Penthouse level suite with private rooftop infinity jacuzzi, 8-guest dining salon, master bedroom with private sauna, and 360-degree skyline panoramas.',
        price: 9500.0,
        capacity: 6,
        image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        status: 'Available',
        created_at: '2026-10-01 10:00:00',
      },
    ];

    // Initial Bookings
    this.bookings = [
      {
        id: this.nextBookingId++,
        customer_id: 1, // Alice
        room_id: 2, // Room 102
        check_in: '2026-11-10',
        check_out: '2026-11-14',
        guests: 2,
        total_price: 10000.0,
        booking_status: 'Confirmed',
        created_at: '2026-10-25 15:20:00',
      },
      {
        id: this.nextBookingId++,
        customer_id: 2, // Bob
        room_id: 3, // Room 103
        check_in: '2026-11-12',
        check_out: '2026-11-15',
        guests: 2,
        total_price: 12000.0,
        booking_status: 'Confirmed',
        created_at: '2026-10-27 11:10:00',
      },
      {
        id: this.nextBookingId++,
        customer_id: 3, // Catherine
        room_id: 4, // Room 104
        check_in: '2026-10-20',
        check_out: '2026-10-24',
        guests: 3,
        total_price: 24000.0,
        booking_status: 'Completed',
        created_at: '2026-10-15 16:00:00',
      },
      {
        id: this.nextBookingId++,
        customer_id: 1, // Alice
        room_id: 1, // Room 101
        check_in: '2026-11-20',
        check_out: '2026-11-22',
        guests: 1,
        total_price: 3000.0,
        booking_status: 'Cancelled',
        created_at: '2026-10-28 09:00:00',
      },
    ];

    this.logQuery('SELECT * FROM customers; -- Initialized database state', [], 4);
    this.logQuery('SELECT * FROM rooms; -- Loaded 6 sample room records', [], 6);
    this.logQuery('SELECT * FROM bookings; -- Loaded 4 sample booking records', [], 4);
  }

  // Customers
  public async getCustomerByEmail(email: string): Promise<Customer | null> {
    const startTime = Date.now();
    const query = 'SELECT * FROM customers WHERE email = ? LIMIT 1;';
    const found = this.customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
    this.logQuery(query, [email], found ? 1 : 0, startTime);
    return found;
  }

  public async getCustomerById(id: number): Promise<Customer | null> {
    const startTime = Date.now();
    const query = 'SELECT id, name, email, phone, created_at FROM customers WHERE id = ?;';
    const found = this.customers.find((c) => c.id === id) || null;
    this.logQuery(query, [id], found ? 1 : 0, startTime);
    return found;
  }

  public async createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const startTime = Date.now();
    const query = 'INSERT INTO customers (name, email, password, phone) VALUES (?, ?, ?, ?);';
    const newCustomer: Customer = {
      id: this.nextCustomerId++,
      name: customer.name,
      email: customer.email,
      password: customer.password,
      phone: customer.phone || '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    this.customers.push(newCustomer);
    this.logQuery(query, [customer.name, customer.email, '[HASHED]', customer.phone], 1, startTime);
    return newCustomer;
  }

  public async updateCustomer(id: number, data: Partial<Pick<Customer, 'name' | 'phone'>>): Promise<Customer | null> {
    const startTime = Date.now();
    const customer = this.customers.find((c) => c.id === id);
    if (!customer) return null;
    if (data.name !== undefined) customer.name = data.name;
    if (data.phone !== undefined) customer.phone = data.phone;
    const query = 'UPDATE customers SET name = ?, phone = ? WHERE id = ?;';
    this.logQuery(query, [customer.name, customer.phone, id], 1, startTime);
    return customer;
  }

  public async getAllCustomers(): Promise<Omit<Customer, 'password'>[]> {
    const startTime = Date.now();
    const query = 'SELECT id, name, email, phone, created_at FROM customers ORDER BY id DESC;';
    const result = this.customers.map(({ password, ...rest }) => rest);
    this.logQuery(query, [], result.length, startTime);
    return result;
  }

  // Rooms
  public async getAllRooms(): Promise<Room[]> {
    const startTime = Date.now();
    const query = 'SELECT * FROM rooms ORDER BY room_number ASC;';
    this.logQuery(query, [], this.rooms.length, startTime);
    return [...this.rooms];
  }

  public async getRoomById(id: number): Promise<Room | null> {
    const startTime = Date.now();
    const query = 'SELECT * FROM rooms WHERE id = ?;';
    const room = this.rooms.find((r) => r.id === id) || null;
    this.logQuery(query, [id], room ? 1 : 0, startTime);
    return room;
  }

  public async getRoomByNumber(roomNumber: string): Promise<Room | null> {
    return this.rooms.find((r) => r.room_number === roomNumber) || null;
  }

  public async createRoom(room: Omit<Room, 'id' | 'created_at'>): Promise<Room> {
    const startTime = Date.now();
    const query = 'INSERT INTO rooms (room_number, room_type, description, price, capacity, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?);';
    const newRoom: Room = {
      id: this.nextRoomId++,
      room_number: room.room_number,
      room_type: room.room_type,
      description: room.description,
      price: Number(room.price),
      capacity: Number(room.capacity),
      image_url: room.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      status: room.status || 'Available',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    this.rooms.push(newRoom);
    this.logQuery(query, [newRoom.room_number, newRoom.room_type, newRoom.description, newRoom.price, newRoom.capacity, newRoom.image_url, newRoom.status], 1, startTime);
    return newRoom;
  }

  public async updateRoom(id: number, data: Partial<Omit<Room, 'id' | 'created_at'>>): Promise<Room | null> {
    const startTime = Date.now();
    const room = this.rooms.find((r) => r.id === id);
    if (!room) return null;
    if (data.room_number !== undefined) room.room_number = data.room_number;
    if (data.room_type !== undefined) room.room_type = data.room_type;
    if (data.description !== undefined) room.description = data.description;
    if (data.price !== undefined) room.price = Number(data.price);
    if (data.capacity !== undefined) room.capacity = Number(data.capacity);
    if (data.image_url !== undefined) room.image_url = data.image_url;
    if (data.status !== undefined) room.status = data.status;

    const query = 'UPDATE rooms SET room_number = ?, room_type = ?, description = ?, price = ?, capacity = ?, image_url = ?, status = ? WHERE id = ?;';
    this.logQuery(query, [room.room_number, room.room_type, room.description, room.price, room.capacity, room.image_url, room.status, id], 1, startTime);
    return room;
  }

  public async deleteRoom(id: number): Promise<boolean> {
    const startTime = Date.now();
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.rooms.splice(index, 1);
    const query = 'DELETE FROM rooms WHERE id = ?;';
    this.logQuery(query, [id], 1, startTime);
    return true;
  }

  // Room Availability Search with strict overlapping date checks
  public async searchAvailableRooms(params: {
    check_in?: string;
    check_out?: string;
    room_type?: string;
    max_price?: number;
    min_capacity?: number;
  }): Promise<Room[]> {
    const startTime = Date.now();
    const { check_in, check_out, room_type, max_price, min_capacity } = params;

    let available = this.rooms.filter((room) => room.status === 'Available');

    if (room_type && room_type !== 'All') {
      available = available.filter((r) => r.room_type.toLowerCase() === room_type.toLowerCase());
    }

    if (max_price !== undefined && max_price > 0) {
      available = available.filter((r) => r.price <= max_price);
    }

    if (min_capacity !== undefined && min_capacity > 0) {
      available = available.filter((r) => r.capacity >= min_capacity);
    }

    // Check date overlaps against Confirmed bookings
    if (check_in && check_out) {
      const requestedIn = new Date(check_in).getTime();
      const requestedOut = new Date(check_out).getTime();

      const bookedRoomIds = new Set(
        this.bookings
          .filter((b) => b.booking_status === 'Confirmed')
          .filter((b) => {
            const bIn = new Date(b.check_in).getTime();
            const bOut = new Date(b.check_out).getTime();
            // Two date intervals [A, B] and [C, D] overlap if A < D and B > C
            return requestedIn < bOut && requestedOut > bIn;
          })
          .map((b) => b.room_id)
      );

      available = available.filter((room) => !bookedRoomIds.has(room.id));
    }

    const query = `
      SELECT r.* FROM rooms r
      WHERE r.status = 'Available'
      ${room_type && room_type !== 'All' ? 'AND r.room_type = ?' : ''}
      ${max_price ? 'AND r.price <= ?' : ''}
      ${min_capacity ? 'AND r.capacity >= ?' : ''}
      ${check_in && check_out ? `AND r.id NOT IN (
        SELECT room_id FROM bookings
        WHERE booking_status = 'Confirmed'
        AND check_in < ? AND check_out > ?
      )` : ''};
    `;

    this.logQuery(
      query,
      [room_type, max_price, min_capacity, check_out, check_in].filter((v) => v !== undefined),
      available.length,
      startTime
    );

    return available;
  }

  // Bookings
  public async createBooking(data: {
    customer_id: number;
    room_id: number;
    check_in: string;
    check_out: string;
    guests: number;
  }): Promise<{ booking?: Booking; error?: string }> {
    const startTime = Date.now();
    const room = this.rooms.find((r) => r.id === data.room_id);
    if (!room) {
      return { error: 'Room not found' };
    }
    if (room.status !== 'Available') {
      return { error: 'Room is currently under maintenance and not available for booking' };
    }
    if (data.guests > room.capacity) {
      return { error: `Number of guests (${data.guests}) exceeds room maximum capacity of ${room.capacity}` };
    }

    const checkInDate = new Date(data.check_in);
    const checkOutDate = new Date(data.check_out);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return { error: 'Invalid check-in or check-out date format' };
    }

    const diffDays = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { error: 'Check-out date must be strictly after check-in date (minimum 1 night stay required)' };
    }

    // Overlap verification with existing Confirmed bookings for the same room
    const requestedIn = checkInDate.getTime();
    const requestedOut = checkOutDate.getTime();

    const hasConflict = this.bookings.some((b) => {
      if (b.room_id !== data.room_id || b.booking_status !== 'Confirmed') {
        return false;
      }
      const bIn = new Date(b.check_in).getTime();
      const bOut = new Date(b.check_out).getTime();
      return requestedIn < bOut && requestedOut > bIn;
    });

    if (hasConflict) {
      return { error: 'The selected room is already reserved for overlapping dates. Please select alternative dates or choose another room.' };
    }

    const totalPrice = Number((diffDays * room.price).toFixed(2));

    const newBooking: Booking = {
      id: this.nextBookingId++,
      customer_id: data.customer_id,
      room_id: data.room_id,
      check_in: data.check_in,
      check_out: data.check_out,
      guests: data.guests,
      total_price: totalPrice,
      booking_status: 'Confirmed',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    this.bookings.push(newBooking);

    const query = 'INSERT INTO bookings (customer_id, room_id, check_in, check_out, guests, total_price, booking_status) VALUES (?, ?, ?, ?, ?, ?, ?);';
    this.logQuery(query, [newBooking.customer_id, newBooking.room_id, newBooking.check_in, newBooking.check_out, newBooking.guests, newBooking.total_price, 'Confirmed'], 1, startTime);

    return { booking: newBooking };
  }

  public async getAllBookings(): Promise<(Booking & { customer_name: string; customer_email: string; customer_phone: string; room_number: string; room_type: string; price_per_night: number })[]> {
    const startTime = Date.now();
    const query = `
      SELECT b.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             r.room_number, r.room_type, r.price AS price_per_night
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC;
    `;

    const result = this.bookings.map((b) => {
      const c = this.customers.find((cust) => cust.id === b.customer_id);
      const r = this.rooms.find((rm) => rm.id === b.room_id);
      return {
        ...b,
        customer_name: c?.name || 'Unknown',
        customer_email: c?.email || '',
        customer_phone: c?.phone || '',
        room_number: r?.room_number || 'N/A',
        room_type: r?.room_type || 'Unknown',
        price_per_night: r?.price || 0,
      };
    });

    this.logQuery(query, [], result.length, startTime);
    return result;
  }

  public async getBookingById(id: number): Promise<(Booking & { customer_name: string; customer_email: string; customer_phone: string; room_number: string; room_type: string; price_per_night: number; image_url: string }) | null> {
    const startTime = Date.now();
    const b = this.bookings.find((item) => item.id === id);
    if (!b) return null;
    const c = this.customers.find((cust) => cust.id === b.customer_id);
    const r = this.rooms.find((rm) => rm.id === b.room_id);

    const query = 'SELECT b.*, c.name, c.email, r.room_number, r.room_type FROM bookings b JOIN customers c ON b.customer_id = c.id JOIN rooms r ON b.room_id = r.id WHERE b.id = ?;';
    this.logQuery(query, [id], 1, startTime);

    return {
      ...b,
      customer_name: c?.name || 'Unknown',
      customer_email: c?.email || '',
      customer_phone: c?.phone || '',
      room_number: r?.room_number || 'N/A',
      room_type: r?.room_type || 'Unknown',
      price_per_night: r?.price || 0,
      image_url: r?.image_url || '',
    };
  }

  public async getBookingsByCustomerId(customerId: number): Promise<(Booking & { room_number: string; room_type: string; price_per_night: number; image_url: string })[]> {
    const startTime = Date.now();
    const query = `
      SELECT b.*, r.room_number, r.room_type, r.price AS price_per_night, r.image_url
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.customer_id = ?
      ORDER BY b.id DESC;
    `;

    const userBookings = this.bookings.filter((b) => b.customer_id === customerId);
    const result = userBookings.map((b) => {
      const r = this.rooms.find((rm) => rm.id === b.room_id);
      return {
        ...b,
        room_number: r?.room_number || 'N/A',
        room_type: r?.room_type || 'Unknown',
        price_per_night: r?.price || 0,
        image_url: r?.image_url || '',
      };
    });

    this.logQuery(query, [customerId], result.length, startTime);
    return result;
  }

  public async cancelBooking(id: number, customerId?: number): Promise<{ success: boolean; message: string; booking?: Booking }> {
    const startTime = Date.now();
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    if (customerId && booking.customer_id !== customerId) {
      return { success: false, message: 'Unauthorized: You may only cancel your own bookings' };
    }

    if (booking.booking_status === 'Cancelled') {
      return { success: false, message: 'This booking has already been cancelled' };
    }

    if (booking.booking_status === 'Completed') {
      return { success: false, message: 'Completed past reservations cannot be cancelled' };
    }

    booking.booking_status = 'Cancelled';
    const query = "UPDATE bookings SET booking_status = 'Cancelled' WHERE id = ?;";
    this.logQuery(query, [id], 1, startTime);

    return { success: true, message: 'Reservation cancelled successfully. The room is now available for other guests.', booking };
  }

  public async updateBookingStatus(id: number, status: 'Confirmed' | 'Cancelled' | 'Completed'): Promise<Booking | null> {
    const startTime = Date.now();
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;
    booking.booking_status = status;
    const query = 'UPDATE bookings SET booking_status = ? WHERE id = ?;';
    this.logQuery(query, [status, id], 1, startTime);
    return booking;
  }

  // Dashboard Stats
  public async getDashboardStats() {
    const startTime = Date.now();
    const totalCustomers = this.customers.filter((c) => c.email !== 'admin@grandpalace.com').length;
    const totalRooms = this.rooms.length;
    const availableRooms = this.rooms.filter((r) => r.status === 'Available').length;
    const totalBookings = this.bookings.length;
    const confirmedBookings = this.bookings.filter((b) => b.booking_status === 'Confirmed').length;
    const cancelledBookings = this.bookings.filter((b) => b.booking_status === 'Cancelled').length;
    const completedBookings = this.bookings.filter((b) => b.booking_status === 'Completed').length;
    const totalRevenue = this.bookings
      .filter((b) => b.booking_status !== 'Cancelled')
      .reduce((sum, b) => sum + b.total_price, 0);

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM rooms) AS total_rooms,
        (SELECT COUNT(*) FROM rooms WHERE status = 'Available') AS available_rooms,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE booking_status = 'Confirmed') AS confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE booking_status = 'Cancelled') AS cancelled_bookings,
        (SELECT SUM(total_price) FROM bookings WHERE booking_status != 'Cancelled') AS total_revenue;
    `;

    this.logQuery(query, [], 1, startTime);

    return {
      totalCustomers,
      totalRooms,
      availableRooms,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
    };
  }

  public getSQLDump(): string {
    return `-- ========================================================
-- Database Name: hotel_booking_db
-- Description: Complete SQL Schema & Seed Data for Online Hotel Booking Management System
-- Generated for MySQL 8.0+ / MySQL Workbench
-- ========================================================

DROP DATABASE IF EXISTS hotel_booking_db;
CREATE DATABASE hotel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_booking_db;

-- --------------------------------------------------------
-- Table 1: customers
-- --------------------------------------------------------
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 2: rooms
-- --------------------------------------------------------
CREATE TABLE rooms (
  id INT NOT NULL AUTO_INCREMENT,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  image_url VARCHAR(500) DEFAULT NULL,
  status ENUM('Available','Maintenance') NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 3: bookings
-- --------------------------------------------------------
CREATE TABLE bookings (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  booking_status ENUM('Confirmed','Cancelled','Completed') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Indexes for Performance & Overlap Queries
-- --------------------------------------------------------
CREATE INDEX idx_bookings_dates ON bookings (room_id, booking_status, check_in, check_out);
CREATE INDEX idx_rooms_status ON rooms (status, room_type, price);

-- --------------------------------------------------------
-- Sample Data: Customers
-- Note: Default password for sample users is: password123
-- Admin password is: admin123
-- --------------------------------------------------------
INSERT INTO customers (id, name, email, password, phone, created_at) VALUES
(1, 'Alice Johnson', 'alice@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 234-5678', '2026-10-15 09:30:00'),
(2, 'Bob Smith', 'bob@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 345-6789', '2026-10-18 14:15:00'),
(3, 'Catherine Davis', 'catherine@example.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 456-7890', '2026-10-22 11:45:00'),
(4, 'Hotel Administrator', 'admin@grandpalace.com', '$2b$10$wTqgUaN3f2kFqC0s/O2wDe7lX5W5q7zYcO2VlmW6I5P9L6rO7P.2e', '+1 (555) 999-0000', '2026-10-01 08:00:00');

-- --------------------------------------------------------
-- Sample Data: Rooms
-- --------------------------------------------------------
INSERT INTO rooms (id, room_number, room_type, description, price, capacity, image_url, status, created_at) VALUES
(1, '101', 'Single Room', 'Compact, quiet haven designed for solo travelers or business professionals. High-speed fiber WiFi, ergonomic workstation, and marble shower.', 1500.00, 1, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(2, '102', 'Double Room', 'Comfortable double room with queen-sized bed, private sunlit balcony, smart 4K flat-screen TV, and artisanal coffee maker.', 2500.00, 2, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(3, '103', 'Deluxe Room', 'Refined comfort boasting panoramic garden and poolside views. Includes an opulent California King bed, soaking tub, and minibar.', 4000.00, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(4, '104', 'Suite Room', 'Spectacular executive suite offering dedicated living and dining quarters, panoramic ocean horizon vistas, and bespoke butler service.', 6000.00, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(5, '105', 'Family Room', 'Expansive family sanctuary featuring twin queen beds plus pull-out daybed, dual vanity bathroom, and convenient kitchenette.', 5000.00, 5, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00'),
(6, '201', 'Presidential Suite', 'The pinnacle of luxury hospitality with rooftop infinity jacuzzi, 8-guest dining salon, master bedroom sauna, and 360-degree skyline views.', 9500.00, 6, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80', 'Available', '2026-10-01 10:00:00');

-- --------------------------------------------------------
-- Sample Data: Bookings
-- --------------------------------------------------------
INSERT INTO bookings (id, customer_id, room_id, check_in, check_out, guests, total_price, booking_status, created_at) VALUES
(1, 1, 2, '2026-11-10', '2026-11-14', 2, 10000.00, 'Confirmed', '2026-10-25 15:20:00'),
(2, 2, 3, '2026-11-12', '2026-11-15', 2, 12000.00, 'Confirmed', '2026-10-27 11:10:00'),
(3, 3, 4, '2026-10-20', '2026-10-24', 3, 24000.00, 'Completed', '2026-10-15 16:00:00'),
(4, 1, 1, '2026-11-20', '2026-11-22', 1, 3000.00, 'Cancelled', '2026-10-28 09:00:00');

-- --------------------------------------------------------
-- Verification SELECT Queries
-- --------------------------------------------------------
SELECT * FROM customers;
SELECT * FROM rooms;
SELECT * FROM bookings;
`;
  }
}

export const db = new DatabaseService();
