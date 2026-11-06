import React, { useState, useEffect } from 'react';
import { Booking } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Hash,
  Users,
  DollarSign
} from 'lucide-react';

interface MyBookingsViewProps {
  onExploreRooms: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onExploreRooms }) => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');

  const fetchBookings = async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${user.id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch your reservations');
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Error loading reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, token]);

  const handleCancelBooking = async (id: number) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');

      // Update in state
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, booking_status: 'Cancelled' } : b))
      );
      setConfirmCancelModal(null);
    } catch (err: any) {
      alert(err.message || 'Unable to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.booking_status === filterStatus;
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Access Your Reservations</h2>
        <p className="text-sm text-slate-500 mb-6">
          Please sign in with your customer account to view and manage your hotel bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
            <span>Customer Reservation Portal</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track upcoming resort stays, past booking records, and cancel reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExploreRooms}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>Book Another Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        {(['All', 'Confirmed', 'Completed', 'Cancelled'] as const).map((status) => {
          const count =
            status === 'All'
              ? bookings.length
              : bookings.filter((b) => b.booking_status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your reservations...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-slate-800">No Reservations Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {filterStatus === 'All'
              ? 'You have not made any hotel bookings yet. Explore our luxurious rooms and book your first stay today!'
              : `You do not have any bookings with status "${filterStatus}".`}
          </p>
          <button
            onClick={onExploreRooms}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Explore Available Rooms
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.booking_status === 'Confirmed';
            const isCancelled = b.booking_status === 'Cancelled';
            const isCompleted = b.booking_status === 'Completed';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Room Info */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={b.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80'}
                    alt={b.room_type}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        #BK-{String(b.id).padStart(4, '0')}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isCancelled && <XCircle className="w-3 h-3 text-rose-600" />}
                        {isCompleted && <Clock className="w-3 h-3 text-slate-500" />}
                        {b.booking_status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-slate-900">{b.room_type}</h3>
                    <p className="text-xs text-slate-500">Room #{b.room_number}</p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {b.check_in} → {b.check_out}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        {b.guests} Guests
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Cancellation */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Stay Price
                    </span>
                    <span className="text-xl font-black text-slate-900 font-sans">
                      ${Number(b.total_price).toLocaleString()}
                    </span>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => setConfirmCancelModal(b)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Cancel Reservation?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Are you sure you want to cancel booking <strong className="text-slate-800">#BK-{confirmCancelModal.id}</strong> for {confirmCancelModal.room_type}?
              This will immediately release room #{confirmCancelModal.room_number} for other travelers on these dates.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleCancelBooking(confirmCancelModal.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
              >
                Yes, Cancel Reservation
              </button>
              <button
                onClick={() => setConfirmCancelModal(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Keep Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
