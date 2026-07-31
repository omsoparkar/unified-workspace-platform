'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, LogOut, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, activeOrg, logout } = useAuth();

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center space-x-3 text-xs text-slate-400">
        <span className="font-semibold text-slate-200">{activeOrg?.name || 'Acme Workspace'}</span>
        <span>/</span>
        <span className="text-slate-400">Enterprise Unified Platform</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, PRs, audit logs..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </Link>

        {/* User Profile Menu */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
