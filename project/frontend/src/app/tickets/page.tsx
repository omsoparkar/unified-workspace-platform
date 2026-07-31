'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../services/ticket.service';
import { TicketPriority, TicketStatus } from '../../types';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Ticket, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Ticket Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', search, status],
    queryFn: () => ticketService.listTickets({ search, status }),
  });

  const createMutation = useMutation({
    mutationFn: (newTicket: { title: string; description: string; priority: TicketPriority }) =>
      ticketService.createTicket(newTicket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: newTitle,
      description: newDescription,
      priority: newPriority,
    });
  };

  const tickets = data?.tickets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Ticket className="w-6 h-6 text-indigo-400" />
            <span>Support Hub — Tenant Tickets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sequential auto-incrementing tickets per organization with status workflows
          </p>
        </div>
        <Button variant="primary" size="sm" className="space-x-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Create New Ticket</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <Input
              placeholder="Search tickets by title, description, or #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ticket List Table */}
      <Card>
        <CardHeader
          title="Tenant Support Queue"
          subtitle={`Showing ${tickets.length} support tickets`}
        />

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading support tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No support tickets found in this tenant context.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 p-3 rounded-xl transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400">#{t.ticketNumber}</span>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-all"
                    >
                      {t.title}
                    </Link>
                    <Badge variant={t.priority === 'URGENT' || t.priority === 'HIGH' ? 'danger' : 'info'}>
                      {t.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                    <span>Author: {t.author?.fullName || 'Tenant Member'}</span>
                    <span>Assignee: {t.assignee?.fullName || 'Unassigned'}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <Badge variant={t.status === 'RESOLVED' ? 'success' : t.status === 'OPEN' ? 'warning' : 'neutral'}>
                    {t.status}
                  </Badge>
                  <Link href={`/tickets/${t.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Support Ticket">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Ticket Title"
            placeholder="e.g., Unable to connect to partner API endpoint"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={4}
              placeholder="Detailed explanation of the issue..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
