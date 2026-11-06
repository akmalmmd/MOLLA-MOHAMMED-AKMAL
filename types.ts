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

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  room_number?: string;
  room_type?: string;
  price_per_night?: number;
  image_url?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

export interface SQLLogEntry {
  id: string;
  timestamp: string;
  query: string;
  params?: any[];
  executionTimeMs: number;
  affectedRows?: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}
