/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Room } from './types.js';
import { Navbar } from './components/Navbar.js';
import { HeroSearch } from './components/HeroSearch.js';
import { RoomCard } from './components/RoomCard.js';
import { RoomDetailsModal } from './components/RoomDetailsModal.js';
import { BookingConfirmationModal } from './components/BookingConfirmationModal.js';
import { AuthModal } from './components/AuthModal.js';
import { MyBookingsView } from './components/MyBookingsView.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { RepositoryHub } from './components/RepositoryHub.js';
import {
  BedDouble,
  ShieldCheck,
  CalendarCheck,
  FolderGit2,
  Phone,
  Mail,
  MapPin,
  Crown,
  Sparkles,
  Info
} from 'lucide-react';

function HotelAppContent() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings' | 'admin' | 'repository'>('explore');

  // Dates state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [roomType, setRoomType] = useState('All');
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Rooms data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userBookingsCount, setUserBookingsCount] = useState(0);

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmedBookingData, setConfirmedBookingData] = useState<{ booking: any; room: Room } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('login');

  // Fetch available rooms based on filter criteria
  const fetchAvailableRooms = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (checkIn) params.append('check_in', checkIn);
      if (checkOut) params.append('check_out', checkOut);
      if (roomType && roomType !== 'All') params.append('room_type', roomType);
      if (maxPrice) params.append('max_price', String(maxPrice));
      if (guests) params.append('min_capacity', String(guests));

      const res = await fetch(`/api/rooms/available?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (e) {
      console.error('Error fetching available rooms:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch user bookings count
  const fetchUserBookingsCount = async () => {
    if (!user || !token) {
      setUserBookingsCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/customers/${user.id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setUserBookingsCount(data.bookings.filter((b: any) => b.booking_status === 'Confirmed').length);
      }
    } catch (e) {
      console.error('Error fetching booking count:', e);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [checkIn, checkOut, roomType, maxPrice, guests]);

  useEffect(() => {
    fetchUserBookingsCount();
  }, [user, token]);

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Notification Announcement */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Full-Stack Online Hotel Booking System • Node.js, Express, MySQL Workbench Ready</span>
      </div>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={handleOpenAuth}
        bookingCount={userBookingsCount}
      />

      {/* Main Views */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <div className="space-y-12 pb-16">
            {/* Hero & Search Engine Console */}
            <HeroSearch
              checkIn={checkIn}
              setCheckIn={setCheckIn}
              checkOut={checkOut}
              setCheckOut={setCheckOut}
              roomType={roomType}
              setRoomType={setRoomType}
              guests={guests}
              setGuests={setGuests}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onSearch={fetchAvailableRooms}
              isSearching={isSearching}
            />

            {/* Room Results Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Live Availability Status
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                    Available Accommodations
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Showing rooms verified free from <strong className="text-slate-800">{checkIn}</strong> to <strong className="text-slate-800">{checkOut}</strong> ({calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-sm">
                    {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} Found
                  </span>
                </div>
              </div>

              {/* Rooms Grid */}
              {isSearching ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Checking MySQL reservation conflicts...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-3">
                  <Info className="w-10 h-10 text-amber-600 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-slate-800">No Rooms Available For These Dates</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All rooms in this category are reserved for overlapping dates, or exceed the selected price limit.
                    Try selecting different travel dates or adjust your price filter.
                  </p>
                  <button
                    onClick={() => {
                      setRoomType('All');
                      setMaxPrice(10000);
                      fetchAvailableRooms();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={(selected) => setSelectedRoom(selected)}
                      nights={calculateNights()}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'bookings' && (
          <MyBookingsView onExploreRooms={() => setActiveTab('explore')} />
        )}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'repository' && <RepositoryHub />}
      </main>

      {/* Room Details & Direct Booking Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultGuests={guests}
          onClose={() => setSelectedRoom(null)}
          onBookingSuccess={(booking, room) => {
            setSelectedRoom(null);
            setConfirmedBookingData({ booking, room });
            fetchAvailableRooms();
            fetchUserBookingsCount();
          }}
          openAuthModal={() => {
            setSelectedRoom(null);
            handleOpenAuth('login');
          }}
        />
      )}

      {/* Booking Confirmation Celebration Modal */}
      {confirmedBookingData && (
        <BookingConfirmationModal
          booking={confirmedBookingData.booking}
          room={confirmedBookingData.room}
          onClose={() => setConfirmedBookingData(null)}
          onViewBookings={() => {
            setConfirmedBookingData(null);
            setActiveTab('bookings');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          fetchUserBookingsCount();
        }}
      />

      {/* Luxury Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>The Grand Azure Resort</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An enterprise full-stack Online Hotel Booking Management System featuring synchronized MySQL storage, date conflict protection, and an administrative control panel.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('explore')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Browse Available Rooms
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('bookings')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  My Reservation History
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Hotel Staff Admin Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('repository')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Download Project ZIP & SQL Dump
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Database Architecture</h4>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
              <li>• Database: hotel_booking_db</li>
              <li>• Table 1: customers</li>
              <li>• Table 2: rooms</li>
              <li>• Table 3: bookings</li>
              <li className="text-amber-400 mt-1">✓ Overlap Check: [A,B] ∩ [C,D]</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Hotel Concierge Contact</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> 1000 Oceanfront Esplanade, Azure Coast
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> +1 (800) 555-AZURE
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" /> reservations@grandazure.com
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>© 2026 Online Hotel Booking Management System. Developed with Node.js, Express, React & MySQL.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('repository')} className="hover:text-slate-300 cursor-pointer">
              MySQL Workbench Documentation
            </button>
            <button onClick={() => setActiveTab('repository')} className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
              Download ZIP Repo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HotelAppContent />
    </AuthProvider>
  );
}
