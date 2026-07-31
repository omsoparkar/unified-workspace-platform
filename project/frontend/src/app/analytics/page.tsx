'use client';

import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Tenant Analytics & Operational Metrics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Performance stats across ticket resolution times, code review velocity, and audit activity
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-slate-100 mt-2">4.2 Hours</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-medium">↓ 18% improvement this month</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">PR Review Velocity</p>
              <p className="text-2xl font-bold text-slate-100 mt-2">1.8 Days</p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">N-Approval Voting active</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Ticket SLA Compliance</p>
              <p className="text-2xl font-bold text-slate-100 mt-2">98.4%</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-400 mt-3">Exceeds 95% target</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Hash Chain Audits</p>
              <p className="text-2xl font-bold text-slate-100 mt-2">100% Valid</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">SHA-256 Verified</p>
        </Card>
      </div>

      {/* Visual Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Weekly Support Hub Volume" subtitle="Ticket creation vs resolution trend" />
          <div className="space-y-4 pt-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const val = [12, 19, 15, 22, 18, 8, 5][idx];
              return (
                <div key={day} className="flex items-center space-x-3 text-xs">
                  <span className="w-8 font-mono text-slate-400">{day}</span>
                  <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${(val / 25) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-semibold text-slate-200">{val}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="System Activity & Traffic Distribution" subtitle="API requests across domain modules" />
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Support Hub (/tickets)</span>
              <Badge variant="primary">42% of traffic</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Review Console (/prs)</span>
              <Badge variant="info">28% of traffic</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Audit Verification (/audit)</span>
              <Badge variant="success">18% of traffic</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Cross-Org Collaboration (/cross-org)</span>
              <Badge variant="neutral">12% of traffic</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
