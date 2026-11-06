import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Crown,
  CalendarCheck,
  ShieldCheck,
  FolderGit2,
  LogOut,
  LogIn,
  User,
  ChevronDown,
  BedDouble,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'bookings' | 'admin' | 'repository';
  setActiveTab: (tab: 'explore' | 'bookings' | 'admin' | 'repository') => void;
  openAuthModal: (mode?: 'login' | 'register' | 'admin') => void;
  bookingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  bookingCount = 0,
}) => {
  const { user, logout, quickSwitch } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Hotel Brand */}
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <Crown className="w-6 h-6 text-slate-950 fill-slate-950/20" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                The Grand Azure
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-medium uppercase tracking-wider border border-amber-500/30">
                  Resort
                </span>
              </span>
              <p className="text-xs text-slate-400 tracking-wider uppercase font-medium">
                Hotel Booking Management System
              </p>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              Rooms & Suites
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all relative cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                My Bookings
                {bookingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-900 text-amber-300 border border-amber-400/40">
                    {bookingCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                if (user?.role === 'admin') {
                  setActiveTab('admin');
                } else {
                  openAuthModal('admin');
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
              {user?.role === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('repository')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'repository'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              MySQL & Repo
            </button>
          </nav>

          {/* User Controls & Demo Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
                title="Switch test accounts for rapid grading"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Switch Role:</span>
                <span className="font-bold text-amber-300">
                  {user ? (user.role === 'admin' ? 'Admin' : user.name.split(' ')[0]) : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowDemoMenu(false)}
                >
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-800">
                    Quick 1-Click Test Users
                  </p>
                  <button
                    onClick={() => {
                      quickSwitch('alice');
                      setShowDemoMenu(false);
                      setActiveTab('explore');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Alice Johnson (Customer)</span>
                    <span className="text-[10px] text-amber-400 font-mono">Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      quickSwitch('bob');
                      setShowDemoMenu(false);
                      setActiveTab('explore');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Bob Smith (Customer)</span>
                    <span className="text-[10px] text-amber-400 font-mono">Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      quickSwitch('admin');
                      setShowDemoMenu(false);
                      setActiveTab('admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-semibold text-amber-300">Hotel Admin</span>
                    <span className="text-[10px] bg-red-950 text-red-300 px-1 rounded border border-red-800 font-mono">
                      Admin
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Profile / Login Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-400 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md ${
              activeTab === 'explore' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" /> Rooms
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-md ${
                activeTab === 'bookings' ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Bookings ({bookingCount})
            </button>
          )}
          <button
            onClick={() => {
              if (user?.role === 'admin') setActiveTab('admin');
              else openAuthModal('admin');
            }}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md ${
              activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </button>
          <button
            onClick={() => setActiveTab('repository')}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md ${
              activeTab === 'repository' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" /> Repo
          </button>
        </div>
      </div>
    </header>
  );
};
