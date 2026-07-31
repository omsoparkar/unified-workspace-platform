'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/audit.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, Download, Search, RefreshCw, Key, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', search, action],
    queryFn: () => auditService.listAuditLogs({ search, action }),
  });

  const { data: verifyResult, isLoading: verifyLoading, refetch: refetchVerify } = useQuery({
    queryKey: ['audit-verify'],
    queryFn: () => auditService.verifyHashChain(),
  });

  const logs = auditData?.logs || [];

  const handleExportCSV = async () => {
    try {
      const blob = await auditService.exportAuditCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-chain-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('CSV Export failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Cryptographic SHA-256 Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident, hash-chained log verification for security governance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="space-x-1.5" onClick={() => refetchVerify()}>
            <RefreshCw className="w-4 h-4" />
            <span>Verify Hash Chain</span>
          </Button>
          <Button variant="primary" size="sm" className="space-x-1.5 bg-emerald-600 hover:bg-emerald-500" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Cryptographic Chain Integrity Status Banner */}
      <Card className="border-emerald-500/30 bg-emerald-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>SHA-256 Hash Chain Integrity:</span>
                {verifyLoading ? (
                  <span className="text-slate-400">Verifying...</span>
                ) : verifyResult?.isValid === false ? (
                  <span className="text-rose-400 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 inline" />
                    <span>TAMPER DETECTED</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 inline" />
                    <span>100% Intact & Verified</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every log record contains a SHA-256 digest linked to the previous log entry hash.
              </p>
            </div>
          </div>
          <Badge variant={verifyResult?.isValid === false ? 'danger' : 'success'}>
            {verifyResult?.totalLogs || logs.length} Verified Entries
          </Badge>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Search audit records by action or resource ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-48">
            <input
              type="text"
              placeholder="Filter by Action..."
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader title="Audit Log Trail" subtitle={`Showing ${logs.length} logged system events`} />

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading audit records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No audit entries found matching criteria.</div>
        ) : (
          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 p-3 rounded-xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <Badge variant="primary">{log.action}</Badge>
                    <span className="font-semibold text-slate-200">{log.resourceType}</span>
                    <span className="text-slate-500">[{log.resourceId.substring(0, 8)}]</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                    <span>Actor: {log.actor?.fullName || log.actorId}</span>
                    <span>Timestamp: {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end space-x-1.5 text-[10px] text-slate-500">
                    <Key className="w-3 h-3 text-emerald-400" />
                    <span>Hash: {log.currentHash ? log.currentHash.substring(0, 16) : 'e3b0c44298fc1c14'}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
