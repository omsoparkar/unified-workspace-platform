'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  GitPullRequest,
  Network,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Settings,
  Bell,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({
  to,
  icon,
  label,
  active,
}) => (
  <Link
    href={to}
    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span>{label}</span>
  </Link>
);

export const Sidebar: React.FC<{ mobileOpen: boolean; setMobileOpen: (open: boolean) => void }> = ({
  mobileOpen,
}) => {
  const pathname = usePathname();
  const { activeOrg, memberships, switchOrg } = useAuth();
  const [orgDropdownOpen, setOrgDropdownOpen] = React.useState(false);

  return (
    <aside
      className={`${
        mobileOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-4 flex flex-col justify-between backdrop-blur-xl shrink-0 z-40`}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/25">
            U
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">Unified Platform</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Enterprise Next.js 15</p>
          </div>
        </div>

        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-left"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{activeOrg?.name || 'Acme Corp'}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{activeOrg?.slug || 'acme-corp'}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
              <p className="text-[10px] uppercase font-semibold text-slate-500 px-2.5 py-1">Switch Organization</p>
              {memberships.map((m) => (
                <button
                  key={m.orgId}
                  onClick={() => {
                    switchOrg(m.orgId);
                    setOrgDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    m.orgId === activeOrg?.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{m.org?.name || m.orgId}</span>
                  <Badge variant="neutral" className="text-[10px]">
                    {m.role}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <SidebarLink to="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === '/'} />
          <SidebarLink to="/tickets" icon={<Ticket />} label="Support Hub" active={pathname.startsWith('/tickets')} />
          <SidebarLink to="/prs" icon={<GitPullRequest />} label="Review Console" active={pathname.startsWith('/prs')} />
          <SidebarLink to="/collaboration" icon={<Network />} label="Cross-Org Partner" active={pathname.startsWith('/collaboration')} />
          <SidebarLink to="/audit" icon={<ShieldCheck />} label="Audit Chain Logs" active={pathname.startsWith('/audit')} />
          <SidebarLink to="/ai-digest" icon={<Sparkles />} label="AI Progress Digest" active={pathname.startsWith('/ai-digest')} />
          <SidebarLink to="/analytics" icon={<BarChart3 />} label="Analytics" active={pathname.startsWith('/analytics')} />
          <SidebarLink to="/notifications" icon={<Bell />} label="Notification Center" active={pathname.startsWith('/notifications')} />
          <SidebarLink to="/settings" icon={<Settings />} label="Settings" active={pathname.startsWith('/settings')} />
        </nav>
      </div>
    </aside>
  );
};
