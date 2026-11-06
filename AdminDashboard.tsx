import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Room, Booking, Customer, DashboardStats } from '../types.js';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Users,
  BedDouble,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'customers'>('overview');
  const [loading, setLoading] = useState(true);

  // Room modal states
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    room_type: 'Double Room',
    description: '',
    price: 2500,
    capacity: 2,
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
    status: 'Available' as 'Available' | 'Maintenance',
  });

  // Customer Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Rooms
      const roomsRes = await fetch('/api/rooms');
      const roomsData = await roomsRes.json();
      if (roomsData.success) setRooms(roomsData.rooms);

      // 3. Bookings
      const bookingsRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) setBookings(bookingsData.bookings);

      // 4. Customers
      const customersRes = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customersData = await customersRes.json();
      if (customersData.success) setCustomers(customersData.customers);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle Room Save (Add or Update)
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save room');

      setRoomModalOpen(false);
      setEditingRoom(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  // Handle Delete Room
  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete room');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Could not delete room');
    }
  };

  // Toggle Room Availability
  const handleToggleRoomStatus = async (room: Room) => {
    const nextStatus = room.status === 'Available' ? 'Maintenance' : 'Available';
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      room_number: '',
      room_type: 'Double Room',
      description: '',
      price: 2500,
      capacity: 2,
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      status: 'Available',
    });
    setRoomModalOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number,
      room_type: room.room_type,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      image_url: room.image_url,
      status: room.status,
    });
    setRoomModalOpen(true);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          You are currently signed in as a customer. Please switch to the Hotel Administrator account to access the inventory and bookings dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-amber-300">
              Admin Console
            </span>
            <span className="text-xs text-slate-500">Live MySQL Synchronization</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Management Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddRoom}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Total Rooms</span>
              <BedDouble className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalRooms}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {stats.availableRooms} Available
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Customers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalCustomers}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Registered Accounts</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Total Bookings</span>
              <CalendarCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalBookings}</div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">All time records</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.confirmedBookings}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Active stays</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stats.cancelledBookings}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">Released slots</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-1">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Booked Gross</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview' || activeTab === 'rooms'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Rooms ({rooms.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Customer Directory ({customers.length})
        </button>
      </div>

      {/* Tab Content 1: Rooms Table */}
      {(activeTab === 'overview' || activeTab === 'rooms') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-serif font-bold text-slate-900 text-lg">Hotel Room Inventory</h3>
            <span className="text-xs text-slate-500">{rooms.length} Total Rooms Configured</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Price / Night</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <img
                          src={room.image_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <span>#{room.room_number}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{room.room_type}</td>
                    <td className="py-3.5 px-4 text-slate-600">{room.capacity} Guests</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${Number(room.price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleRoomStatus(room)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-transform active:scale-95 ${
                          room.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {room.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditRoom(room)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Bookings Table */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-serif font-bold text-slate-900 text-lg">All Customer Reservations</h3>
            <span className="text-xs text-slate-500">{bookings.length} Total Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #BK-{String(b.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.customer_name}</span>
                        <span className="text-xs text-slate-400">{b.customer_email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        Room #{b.room_number} ({b.room_type})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="block font-medium">
                        {b.check_in} → {b.check_out}
                      </span>
                      <span className="text-[11px] text-slate-400">{b.guests} Guests</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${Number(b.total_price).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          b.booking_status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.booking_status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={b.booking_status}
                        onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Customer Directory */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-serif font-bold text-slate-900 text-lg">Registered Customers</h3>
            <span className="text-xs text-slate-500">{customers.length} Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{c.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setRoomModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">
              {editingRoom ? 'Update Room Information' : 'Add New Room'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure room inventory records stored in the MySQL \`rooms\` table.
            </p>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomForm.room_number}
                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    placeholder="e.g. 106"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room Category</label>
                  <select
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 cursor-pointer"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite Room">Suite Room</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Per Night ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guest Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  placeholder="Describe room perks and view..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={roomForm.image_url}
                  onChange={(e) => setRoomForm({ ...roomForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Availability Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
