'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prService } from '../../services/pr.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { GitPullRequest, Plus, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function PRsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PR Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredApprovals, setRequiredApprovals] = useState(2);

  const { data, isLoading } = useQuery({
    queryKey: ['prs', search, status],
    queryFn: () => prService.listPRs({ search, status }),
  });

  const createMutation = useMutation({
    mutationFn: (newPR: { title: string; description: string; requiredApprovals: number }) =>
      prService.createPR(newPR),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, description, requiredApprovals });
  };

  const prs = data?.prs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <GitPullRequest className="w-6 h-6 text-purple-400" />
            <span>Review Console — Pull Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            N-approval code review voting engine with diff inspection and versioning
          </p>
        </div>
        <Button variant="primary" size="sm" className="space-x-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Pull Request</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Search pull requests by title or PR #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="APPROVED">Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="MERGED">Merged</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* PR List Table */}
      <Card>
        <CardHeader
          title="Review Queue"
          subtitle={`Showing ${prs.length} pull requests`}
        />

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading pull requests...</span>
          </div>
        ) : prs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No pull requests found matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {prs.map((p) => (
              <div
                key={p.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 p-3 rounded-xl transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-purple-400">PR-{p.prNumber}</span>
                    <Link
                      href={`/prs/${p.id}`}
                      className="text-sm font-semibold text-slate-100 hover:text-purple-400 transition-all"
                    >
                      {p.title}
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                    <span>Author: {p.author?.fullName || 'Reviewer'}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="font-semibold text-indigo-300">
                      Voting Progress: {p.currentApprovals} / {p.requiredApprovals} approvals
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <Badge
                    variant={
                      p.status === 'APPROVED' || p.status === 'MERGED'
                        ? 'success'
                        : p.status === 'CHANGES_REQUESTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {p.status}
                  </Badge>
                  <Link href={`/prs/${p.id}`}>
                    <Button variant="outline" size="sm">
                      Inspect & Vote
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create PR Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Pull Request">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="PR Title"
            placeholder="e.g., feat: Add SHA-256 Hash Chain verification endpoint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Required Approval Votes ($N$)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">PR Description & Patch Notes</label>
            <textarea
              rows={4}
              placeholder="Describe the architectural changes, refactors, or feature additions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create PR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
