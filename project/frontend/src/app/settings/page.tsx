'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, User, Building2, Shield, Lock, Users } from 'lucide-react';

export default function SettingsPage() {
  const { user, activeOrg, memberships } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'org' | 'members' | 'security'>('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          <span>Workspace Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage profile, organization parameters, member roles & security</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'User Profile', icon: <User className="w-4 h-4" /> },
          { id: 'org', label: 'Organization', icon: <Building2 className="w-4 h-4" /> },
          { id: 'members', label: 'Members & Roles', icon: <Users className="w-4 h-4" /> },
          { id: 'security', label: 'Security & Auth', icon: <Shield className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl space-y-4">
          <CardHeader title="User Profile Details" subtitle="Your account information" />
          <div className="space-y-4">
            <Input label="Full Name" defaultValue={user?.fullName || ''} />
            <Input label="Email Address" defaultValue={user?.email || ''} disabled />
            <div className="pt-2">
              <Button variant="primary">Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Organization Tab */}
      {activeTab === 'org' && (
        <Card className="max-w-2xl space-y-4">
          <CardHeader title="Active Organization Parameters" subtitle="Multi-tenant org context" />
          <div className="space-y-4">
            <Input label="Organization Name" defaultValue={activeOrg?.name || ''} />
            <Input label="Organization Slug" defaultValue={activeOrg?.slug || ''} disabled />
            <div className="pt-2">
              <Button variant="primary">Update Organization</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Members & Roles Tab */}
      {activeTab === 'members' && (
        <Card className="space-y-4">
          <CardHeader title="Organization Members & Role Assignments" subtitle="RBAC permissions" />
          <div className="divide-y divide-slate-800 font-mono text-xs">
            {memberships.map((m) => (
              <div key={m.id || m.orgId} className="py-3 flex items-center justify-between p-2 rounded-xl">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-100">{user?.fullName}</span>
                  <p className="text-slate-500 text-[10px]">{user?.email}</p>
                </div>
                <Badge variant="primary">{m.role}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="max-w-2xl space-y-4">
          <CardHeader title="Security & Token Management" subtitle="Argon2id hashing & Redis JTI revocation" />
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <p className="font-semibold text-indigo-400 flex items-center space-x-1.5">
                <Lock className="w-4 h-4" />
                <span>Argon2id Password Hashing</span>
              </p>
              <p className="text-slate-400">Passwords stored securely using state-of-the-art Argon2id hashing.</p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <p className="font-semibold text-purple-400 flex items-center space-x-1.5">
                <Shield className="w-4 h-4" />
                <span>Redis JTI Blacklist Token Revocation</span>
              </p>
              <p className="text-slate-400">Logout requests immediately invalidate JWTs across distributed nodes.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
