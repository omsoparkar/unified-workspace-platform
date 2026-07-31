'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../services/ticket.service';
import { prService } from '../services/pr.service';
import { auditService } from '../services/audit.service';
import { crossOrgService } from '../services/cross-org.service';
import { aiDigestService } from '../services/ai-digest.service';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Ticket, GitPullRequest, Network, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: ticketData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.listTickets(),
  });

  const { data: prData, isLoading: prsLoading } = useQuery({
    queryKey: ['prs'],
    queryFn: () => prService.listPRs(),
  });

  const { data: auditVerify } = useQuery({
    queryKey: ['audit-verify'],
    queryFn: () => auditService.verifyHashChain(),
  });

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: () => crossOrgService.listConnections(),
  });

  const tickets = ticketData?.tickets || [];
  const prs = prData?.prs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Enterprise SaaS Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant insights across Support Hub, Review Console, Audit Chain & AI Digests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/ai-digest">
            <Button variant="primary" size="sm" className="space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Progress Digest</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Support Tickets</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">{ticketsLoading ? '...' : tickets.length}</p>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Live tenant queue</span>
            <Link href="/tickets" className="text-indigo-400 hover:underline flex items-center">
              View Hub <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-purple-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Review PRs</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">{prsLoading ? '...' : prs.length}</p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <GitPullRequest className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">N-Approval Voting Engine</span>
            <Link href="/prs" className="text-purple-400 hover:underline flex items-center">
              Review PRs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-blue-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partner Connections</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">{connections?.length || 0}</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <Badge variant="success">Handshake Active</Badge>
            <Link href="/collaboration" className="text-blue-400 hover:underline flex items-center">
              Partners <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-emerald-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Chain Status</p>
              <p className="text-xl font-bold text-emerald-400 mt-2">
                {auditVerify?.isValid === false ? 'Tampered' : '100% Valid'}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">SHA-256 Hash Chain</span>
            <Link href="/audit" className="text-emerald-400 hover:underline flex items-center">
              Audit Logs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Content Split: Tickets & PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets Overview */}
        <Card>
          <CardHeader
            title="Recent Support Tickets"
            subtitle="Tenant tickets with auto-incrementing sequential numbers"
            action={
              <Link href="/tickets">
                <Button variant="outline" size="sm">
                  All Tickets
                </Button>
              </Link>
            }
          />
          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active tickets found.</p>
          ) : (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all"
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">#{t.ticketNumber}</span>
                      <Link href={`/tickets/${t.id}`} className="text-sm font-semibold text-slate-100 hover:text-indigo-400 truncate">
                        {t.title}
                      </Link>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{t.description}</p>
                  </div>
                  <Badge variant={t.status === 'RESOLVED' ? 'success' : 'warning'}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Code Review PRs Overview */}
        <Card>
          <CardHeader
            title="Active Code Review PRs"
            subtitle="N-approval required pull requests"
            action={
              <Link href="/prs">
                <Button variant="outline" size="sm">
                  Review Console
                </Button>
              </Link>
            }
          />
          {prs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No open pull requests.</p>
          ) : (
            <div className="space-y-3">
              {prs.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all"
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-400">PR-{p.prNumber}</span>
                      <Link href={`/prs/${p.id}`} className="text-sm font-semibold text-slate-100 hover:text-purple-400 truncate">
                        {p.title}
                      </Link>
                    </div>
                    <p className="text-xs text-slate-400">
                      Approvals: {p.currentApprovals} / {p.requiredApprovals} required
                    </p>
                  </div>
                  <Badge variant={p.status === 'APPROVED' ? 'success' : p.status === 'OPEN' ? 'info' : 'danger'}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
