import React from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';

interface HeroSearchProps {
  checkIn: string;
  setCheckIn: (val: string) => void;
  checkOut: string;
  setCheckOut: (val: string) => void;
  roomType: string;
  setRoomType: (val: string) => void;
  guests: number;
  setGuests: (val: number) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  roomType,
  setRoomType,
  guests,
  setGuests,
  maxPrice,
  setMaxPrice,
  onSearch,
  isSearching,
}) => {
  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();

  return (
    <div className="relative">
      {/* Hero Showcase Background */}
      <div className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div
          className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40 z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Five-Star Luxury Resort & Coastal Sanctuary
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Where Sophistication Meets <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Timeless Hospitality
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Reserve opulent suites, ocean-view doubles, and executive residences.
            Our real-time booking engine automatically guarantees zero overlapping conflicts.
          </p>
        </div>
      </div>

      {/* Floating Booking Search Console */}
      <div className="max-w-6xl mx-auto -mt-10 sm:-mt-14 relative z-20 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 p-5 sm:p-7 backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Check-In Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Check-In Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium bg-slate-50/50"
              />
            </div>

            {/* Check-Out Date */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Check-Out Date
                </label>
                {nights > 0 && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium bg-slate-50/50"
              />
            </div>

            {/* Room Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-600" />
                Room Category
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium bg-slate-50/50 cursor-pointer"
              >
                <option value="All">All Room Categories</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Deluxe Room">Deluxe Room</option>
                <option value="Suite Room">Suite Room</option>
                <option value="Family Room">Family Room</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>

            {/* Guests Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium bg-slate-50/50 cursor-pointer"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5 Guests</option>
                <option value={6}>6+ Guests</option>
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={onSearch}
                disabled={isSearching}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Filtering...' : 'Find Available Rooms'}
              </button>
            </div>
          </div>

          {/* Quick Price Slider Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Filter by Maximum Price:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ${maxPrice.toLocaleString()} / night
              </span>
            </div>
            <div className="w-full sm:w-64 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium">$1,500</span>
              <input
                type="range"
                min={1500}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[11px] text-slate-400 font-medium">$10,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
