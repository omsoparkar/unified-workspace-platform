'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiDigestService } from '../../services/ai-digest.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sparkles, Calendar, CheckCircle2, AlertCircle, ListChecks, Bot } from 'lucide-react';

export default function AIDigestPage() {
  const queryClient = useQueryClient();
  const [periodDays, setPeriodDays] = useState(7);
  const [activeDigestId, setActiveDigestId] = useState<string | null>(null);

  const { data: digests = [], isLoading } = useQuery({
    queryKey: ['ai-digests'],
    queryFn: () => aiDigestService.listDigests(),
  });

  const generateMutation = useMutation({
    mutationFn: (days: number) => aiDigestService.generateDigest(days),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-digests'] });
    },
  });

  const activeDigest = digests.find((d) => d.id === activeDigestId) || digests[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>AI Progress Digest Service</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pluggable AI progress tracker with BullMQ async background generation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
          <Button
            variant="primary"
            size="sm"
            className="space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            onClick={() => generateMutation.mutate(periodDays)}
            isLoading={generateMutation.isPending}
          >
            <Bot className="w-4 h-4" />
            <span>Trigger Async AI Job</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Previous Generated Digests List */}
        <Card>
          <CardHeader title="Generated Digests" subtitle="Historical report archives" />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading AI digests...</span>
            </div>
          ) : digests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No AI progress digests generated yet.</div>
          ) : (
            <div className="space-y-2">
              {digests.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDigestId(d.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 ${
                    d.id === activeDigest?.id
                      ? 'bg-purple-600/15 border-purple-500/40 text-slate-100 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Digest #{d.id.substring(0, 6)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs truncate text-slate-400">{d.summary}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Selected AI Digest Detailed View */}
        <div className="lg:col-span-2">
          {!activeDigest ? (
            <Card>
              <p className="p-8 text-center text-slate-400 text-xs">
                Select a digest report on the left or trigger a new AI job above.
              </p>
            </Card>
          ) : (
            <Card className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Executive AI Summary</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Period: {new Date(activeDigest.periodStart).toLocaleDateString()} —{' '}
                    {new Date(activeDigest.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>

              {/* Summary Paragraph */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
                {activeDigest.summary}
              </div>

              {/* Key Achievements & Blockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Key Achievements</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activeDigest.keyAchievements || ['Resolved 12 support tickets', 'Merged N-approval PR #4']).map(
                      (item, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Blockers & Bottlenecks</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(activeDigest.blockersIdentified || ['Pending partner handshake approval']).map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
