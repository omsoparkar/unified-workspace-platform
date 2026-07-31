'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prService } from '../../../services/pr.service';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DiffViewer } from '../../../components/ui/DiffViewer';
import { ArrowLeft, CheckCircle2, XCircle, GitMerge, MessageSquare, Code2, Send, History } from 'lucide-react';

export default function PRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const prId = params.id as string;

  const [feedback, setFeedback] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(1);
  const [commentText, setCommentText] = useState('');

  const { data: pr, isLoading } = useQuery({
    queryKey: ['pr', prId],
    queryFn: () => prService.getPRById(prId),
    enabled: !!prId,
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['pr-versions', prId],
    queryFn: () => prService.getPRVersions(prId),
    enabled: !!prId,
  });

  const { data: diffData } = useQuery({
    queryKey: ['pr-diff', prId, selectedVersion],
    queryFn: () => prService.getPRVersionDiff(prId, selectedVersion),
    enabled: !!prId,
  });

  const approveMutation = useMutation({
    mutationFn: () => prService.approvePR(prId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      setFeedback('');
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: () => prService.requestChangesPR(prId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      setFeedback('');
    },
  });

  const mergeMutation = useMutation({
    mutationFn: () => prService.mergePR(prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      queryClient.invalidateQueries({ queryKey: ['prs'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => prService.addComment(prId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr', prId] });
      setCommentText('');
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading pull request details...</span>
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <p>Pull Request not found.</p>
        <Button variant="outline" onClick={() => router.push('/prs')}>
          Back to PRs
        </Button>
      </div>
    );
  }

  const sampleDiff = diffData?.diff || `--- a/src/core/crypto/hash-chain.service.ts\n+++ b/src/core/crypto/hash-chain.service.ts\n@@ -12,6 +12,9 @@\n export class HashChainService {\n-  public calculateHash(prev: string): string {\n+  public calculateHash(prev: string, payload: Record<string, any>): string {\n+    const payloadStr = JSON.stringify(payload);\n+    return crypto.createHash('sha256').update(prev + payloadStr).digest('hex');\n   }\n }`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <button
          onClick={() => router.push('/prs')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Console</span>
        </button>

        {/* Voting & Merge Controls */}
        <div className="flex items-center space-x-3">
          <Badge
            variant={
              pr.status === 'APPROVED' || pr.status === 'MERGED'
                ? 'success'
                : pr.status === 'CHANGES_REQUESTED'
                ? 'danger'
                : 'warning'
            }
          >
            {pr.status}
          </Badge>

          {pr.status !== 'MERGED' && (
            <Button
              variant="primary"
              size="sm"
              className="space-x-1.5 bg-emerald-600 hover:bg-emerald-500"
              onClick={() => mergeMutation.mutate()}
              isLoading={mergeMutation.isPending}
              disabled={pr.currentApprovals < pr.requiredApprovals}
            >
              <GitMerge className="w-4 h-4" />
              <span>Merge Pull Request</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Diff & Version History */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-purple-400">PR-{pr.prNumber}</span>
                    <h1 className="text-xl font-bold text-slate-100">{pr.title}</h1>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted by {pr.author?.fullName || 'Reviewer'} on {new Date(pr.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {pr.description}
              </p>
            </div>
          </Card>

          {/* Diff Inspector Card */}
          <Card>
            <CardHeader
              title="Code Diff Viewer"
              subtitle="Inspect changes and patch lines"
              action={
                <div className="flex items-center space-x-2 text-xs">
                  <History className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Version:</span>
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    {versions.length === 0 ? (
                      <option value={1}>v1 (Latest Commit)</option>
                    ) : (
                      versions.map((v) => (
                        <option key={v.id} value={v.versionNumber}>
                          v{v.versionNumber} ({v.commitHash.substring(0, 7)})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              }
            />

            <DiffViewer diffText={sampleDiff} />
          </Card>

          {/* Discussion & Comments */}
          <Card>
            <CardHeader title="Review Discussion Threads" />
            <div className="space-y-3 mb-4">
              {pr.comments?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No inline review comments yet.</p>
              ) : (
                pr.comments?.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{c.author?.fullName || 'Reviewer'}</span>
                      <span className="text-slate-500 text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) commentMutation.mutate(commentText);
              }}
              className="flex items-center space-x-2 pt-2 border-t border-slate-800"
            >
              <input
                type="text"
                placeholder="Add inline code review comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Button type="submit" variant="secondary" size="sm" isLoading={commentMutation.isPending}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>

        {/* N-Approval Voting Box */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="N-Approval Voting Panel" subtitle="Threshold required to merge" />

            <div className="space-y-4">
              {/* Approval Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Approvals Progress</span>
                  <span className="text-purple-400">
                    {pr.currentApprovals} / {pr.requiredApprovals} Votes
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, (pr.currentApprovals / pr.requiredApprovals) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Feedback Input */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-slate-300">Review Feedback (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Notes on code architecture, safety, performance..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full space-x-2 bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => approveMutation.mutate()}
                  isLoading={approveMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Code Changes (+1 Vote)</span>
                </Button>

                <Button
                  variant="danger"
                  className="w-full space-x-2"
                  onClick={() => requestChangesMutation.mutate()}
                  isLoading={requestChangesMutation.isPending}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Request Changes</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
