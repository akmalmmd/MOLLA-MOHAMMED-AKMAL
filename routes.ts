import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { authenticateToken, requireAdmin, generateToken, AuthRequest } from './auth.js';
import { STANDALONE_REPO_FILES } from './repoFiles.js';

const router = Router();

// ==========================================
// Customer Routes
// ==========================================

// POST /api/customers/register - Register a new customer
router.post('/customers/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Full name, email address, and password are required.' });
      return;
    }

    const existing = await db.getCustomerByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = await db.createCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
    });

    const token = generateToken({
      id: newCustomer.id,
      email: newCustomer.email,
      name: newCustomer.name,
      role: 'customer',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to The Grand Azure.',
      token,
      customer: {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        role: 'customer',
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// POST /api/customers/login - Customer login
router.post('/customers/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Both email and password are required.' });
      return;
    }

    const customer = await db.getCustomerByEmail(email);
    if (!customer) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const role = customer.email === 'admin@grandpalace.com' ? 'admin' : 'customer';
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /api/admin/login - Dedicated Admin login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required.' });
      return;
    }

    const customer = await db.getCustomerByEmail(email);
    if (!customer || customer.email !== 'admin@grandpalace.com') {
      res.status(401).json({ success: false, message: 'Admin account not recognized.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid administrative credentials.' });
      return;
    }

    const token = generateToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'admin',
    });

    res.json({
      success: true,
      message: 'Admin authorization granted.',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: 'admin',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers/:id - Get customer details
router.get('/customers/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile.' });
      return;
    }

    const customer = await db.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer record not found.' });
      return;
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created_at: customer.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/customers/:id - Update customer details
router.put('/customers/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const { name, phone } = req.body;
    const updated = await db.updateCustomer(id, { name, phone });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Customer not found.' });
      return;
    }

    res.json({ success: true, message: 'Customer profile updated successfully.', customer: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers - Get all customers (Admin)
router.get('/customers', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const customers = await db.getAllCustomers();
    res.json({ success: true, customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// Room Routes
// ==========================================

// GET /api/rooms - Get all rooms
router.get('/rooms', async (_req: Request, res: Response) => {
  try {
    const rooms = await db.getAllRooms();
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/available - Search available rooms
router.get('/rooms/available', async (req: Request, res: Response) => {
  try {
    const { check_in, check_out, room_type, max_price, min_capacity } = req.query;

    const rooms = await db.searchAvailableRooms({
      check_in: check_in as string,
      check_out: check_out as string,
      room_type: room_type as string,
      max_price: max_price ? Number(max_price) : undefined,
      min_capacity: min_capacity ? Number(min_capacity) : undefined,
    });

    res.json({
      success: true,
      count: rooms.length,
      rooms,
      filters: { check_in, check_out, room_type, max_price, min_capacity },
    });
  } catch (error: any) {
    console.error('Available rooms error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/rooms/:id - Get one room
router.get('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const room = await db.getRoomById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }
    res.json({ success: true, room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/rooms - Add a new room (Admin)
router.post('/rooms', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { room_number, room_type, description, price, capacity, image_url, status } = req.body;

    if (!room_number || !room_type || !price) {
      res.status(400).json({ success: false, message: 'Room number, room type, and price are required fields.' });
      return;
    }

    const existing = await db.getRoomByNumber(room_number);
    if (existing) {
      res.status(409).json({ success: false, message: `Room number ${room_number} is already registered.` });
      return;
    }

    const newRoom = await db.createRoom({
      room_number,
      room_type,
      description: description || '',
      price: Number(price),
      capacity: Number(capacity) || 1,
      image_url: image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      status: status || 'Available',
    });

    res.status(201).json({ success: true, message: 'Room added successfully to inventory.', room: newRoom });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/rooms/:id - Update room information (Admin)
router.put('/rooms/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updateRoom(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }
    res.json({ success: true, message: 'Room updated successfully.', room: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/rooms/:id - Delete a room (Admin)
router.delete('/rooms/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const success = await db.deleteRoom(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }
    res.json({ success: true, message: 'Room removed successfully from system.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// Booking Routes
// ==========================================

// POST /api/bookings - Create a new reservation
router.post('/bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, check_in, check_out, guests } = req.body;
    const customer_id = req.user!.id;

    if (!room_id || !check_in || !check_out) {
      res.status(400).json({ success: false, message: 'Room ID, check-in date, and check-out date are required.' });
      return;
    }

    const result = await db.createBooking({
      customer_id,
      room_id: Number(room_id),
      check_in,
      check_out,
      guests: Number(guests) || 1,
    });

    if (result.error) {
      res.status(400).json({ success: false, message: result.error });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully!',
      booking: result.booking,
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings - Get all bookings (Admin)
router.get('/bookings', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await db.getAllBookings();
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/bookings/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const booking = await db.getBookingById(id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking record not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && booking.customer_id !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Access denied: You can only view your own reservations.' });
      return;
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers/:id/bookings - Get bookings for a particular customer
router.get('/customers/:id/bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = Number(req.params.id);
    if (req.user?.role !== 'admin' && req.user?.id !== customerId) {
      res.status(403).json({ success: false, message: 'Access denied: You can only view your own bookings.' });
      return;
    }

    const bookings = await db.getBookingsByCustomerId(customerId);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookings/:id/cancel - Cancel an existing reservation
router.put('/bookings/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const customerId = req.user?.role === 'admin' ? undefined : req.user?.id;

    const result = await db.cancelBooking(id, customerId);
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.json({ success: true, message: result.message, booking: result.booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookings/:id/status - Update booking status (Admin)
router.put('/bookings/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { booking_status } = req.body;

    if (!['Confirmed', 'Cancelled', 'Completed'].includes(booking_status)) {
      res.status(400).json({ success: false, message: 'Valid statuses: Confirmed, Cancelled, Completed' });
      return;
    }

    const updated = await db.updateBookingStatus(id, booking_status);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({ success: true, message: `Reservation status updated to ${booking_status}.`, booking: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// Dashboard Routes
// ==========================================

// GET /api/dashboard - Get admin dashboard statistics
router.get('/dashboard', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// Developer / Repository / SQL Workbench Hub
// ==========================================

// GET /api/db/query-logs - View live SQL logs
router.get('/db/query-logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: db.getQueryLogs() });
});

// GET /api/db/sql-dump - View the complete SQL dump
router.get('/db/sql-dump', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(db.getSQLDump());
});

// GET /api/repository/files - Get all standalone files for ZIP download
router.get('/repository/files', (_req: Request, res: Response) => {
  res.json({ success: true, files: STANDALONE_REPO_FILES });
});

export default router;
