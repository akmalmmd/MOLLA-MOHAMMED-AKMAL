import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Room } from '../types.js';
import { CheckCircle, Calendar, Hash, CreditCard, Users, ArrowRight, X } from 'lucide-react';

interface BookingConfirmationModalProps {
  booking: any;
  room: Room;
  onClose: () => void;
  onViewBookings: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  room,
  onClose,
  onViewBookings,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback if canvas not available
    }
  }, []);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900">Reservation Confirmed!</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Thank you for choosing The Grand Azure Resort. Your stay is locked into our reservation database.
        </p>

        {/* Booking Card Details */}
        <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Booking Reference</span>
              <span className="font-mono font-bold text-slate-800 text-sm">#BK-{String(booking.id).padStart(4, '0')}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Confirmed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={room.image_url}
              alt={room.room_type}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base">{room.room_type}</h4>
              <p className="text-xs text-slate-500">Room #{room.room_number}</p>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">
                ${Number(room.price).toLocaleString()} / night
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Check-In</span>
              <span className="font-bold text-slate-800">{booking.check_in}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Check-Out</span>
              <span className="font-bold text-slate-800">{booking.check_out}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Guests</span>
              <span className="font-bold text-slate-800">{booking.guests} Guests</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Total Amount</span>
              <span className="font-bold text-emerald-700 text-sm">${Number(booking.total_price).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onViewBookings}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    </div>
  );
};
