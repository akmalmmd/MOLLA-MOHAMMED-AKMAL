import React, { useState, useEffect } from 'react';
import { Room } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  X,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  BedSingle,
  Coffee,
  Tv,
  AirVent
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room | null;
  onClose: () => void;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultGuests: number;
  onBookingSuccess: (booking: any, room: Room) => void;
  openAuthModal: () => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  onClose,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  onBookingSuccess,
  openAuthModal,
}) => {
  const { user, token } = useAuth();
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCheckIn(defaultCheckIn);
    setCheckOut(defaultCheckOut);
    setGuests(defaultGuests);
    setErrorMessage(null);
  }, [room, defaultCheckIn, defaultCheckOut, defaultGuests]);

  if (!room) return null;

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * Number(room.price);

  const handleBooking = async () => {
    setErrorMessage(null);

    if (!user) {
      openAuthModal();
      return;
    }

    if (nights <= 0) {
      setErrorMessage('Check-out date must be strictly after check-in date (minimum 1 night).');
      return;
    }

    if (guests > room.capacity) {
      setErrorMessage(`Maximum capacity for this room is ${room.capacity} guests.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete reservation');
      }

      onBookingSuccess(data.booking, room);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with booking server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Room Imagery & Amenities */}
        <div className="md:w-1/2 relative bg-slate-100 flex flex-col">
          <div className="h-64 md:h-full min-h-[280px] relative">
            <img
              src={room.image_url}
              alt={room.room_type}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wider mb-2 inline-block">
                Room #{room.room_number}
              </span>
              <h2 className="text-2xl font-serif font-bold">{room.room_type}</h2>
              <p className="text-xs text-slate-300 mt-1">The Grand Azure Luxury Collection</p>
            </div>
          </div>
        </div>

        {/* Right Column: Room Details & Reservation Console */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
                  ${Number(room.price).toLocaleString()}
                </span>
                <span className="text-slate-500 text-xs ml-1 font-medium">/ night</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Guaranteed Available
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{room.description}</p>
            </div>

            {/* Room Features Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Up to {room.capacity} Guests</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <BedSingle className="w-4 h-4 text-amber-600" />
                <span>Luxury Bedding</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                <span>Nespresso Machine</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <AirVent className="w-4 h-4 text-amber-600" />
                <span>Climate Control</span>
              </div>
            </div>

            {/* Reservation Form */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-slate-600">
                    ${Number(room.price).toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-base text-slate-900">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="space-y-2">
            <button
              onClick={handleBooking}
              disabled={isSubmitting || nights <= 0}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting
                ? 'Validating & Confirming Reservation...'
                : user
                ? `Confirm Reservation • $${totalPrice.toLocaleString()}`
                : 'Sign In & Confirm Reservation'}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              🔒 Instant confirmation. No pre-payment fees. Free cancellation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
