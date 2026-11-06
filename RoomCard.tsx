import React from 'react';
import { Room } from '../types.js';
import { Users, Wifi, Bath, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  nights?: number;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, nights = 1 }) => {
  const isAvailable = room.status === 'Available';
  const totalPrice = nights > 0 ? room.price * nights : room.price;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <img
          src={room.image_url}
          alt={room.room_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-900/90 text-amber-300 backdrop-blur-md border border-amber-400/30">
            Room #{room.room_number}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Available
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-rose-400" /> Maintenance
              </>
            )}
          </span>
        </div>

        {/* Bottom image overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900/70 px-2.5 py-1 rounded-lg backdrop-blur-sm">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Capacity: {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              {room.room_type}
            </h3>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {room.description}
          </p>

          {/* Quick Perks */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-amber-600" /> High-speed WiFi
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-amber-600" /> En-suite Bath
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Concierge
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                ${Number(room.price).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ night</span>
            </div>
            {nights > 1 && (
              <p className="text-[11px] text-amber-700 font-semibold">
                ${totalPrice.toLocaleString()} total ({nights} nights)
              </p>
            )}
          </div>

          <button
            onClick={() => onSelect(room)}
            disabled={!isAvailable}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer ${
              isAvailable
                ? 'bg-slate-900 hover:bg-amber-600 text-white hover:text-white shadow-slate-900/10 hover:shadow-amber-600/30 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Book Room' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};
