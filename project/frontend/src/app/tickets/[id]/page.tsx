'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../../services/ticket.service';
import { TicketStatus } from '../../../types';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, MessageSquare, Paperclip, Send, Clock, User, CheckCircle2 } from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ticketId = params.id as string;

  const [commentText, setCommentText] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicketById(ticketId),
    enabled: !!ticketId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => ticketService.listComments(ticketId),
    enabled: !!ticketId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => ticketService.changeStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => ticketService.addComment(ticketId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      setCommentText('');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <p>Ticket not found.</p>
        <Button variant="outline" onClick={() => router.push('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <button
          onClick={() => router.push('/tickets')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        {/* Status Actions */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={ticket.status}
            onChange={(e) => statusMutation.mutate(e.target.value as TicketStatus)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Content & Comment Thread */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-bold text-indigo-400">#{ticket.ticketNumber}</span>
                    <h1 className="text-xl font-bold text-slate-100">{ticket.title}</h1>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Created on {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'danger' : 'info'}>
                  {ticket.priority}
                </Badge>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          </Card>

          {/* Comment Section */}
          <Card>
            <CardHeader title="Activity & Comment Discussion" subtitle={`${comments.length} comments`} />

            {/* Comment List */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-slate-200">{c.author?.fullName || 'User'}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 pt-4 border-t border-slate-800">
              <textarea
                rows={3}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" className="space-x-1.5" isLoading={commentMutation.isPending}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Ticket Meta & Metadata" />
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Author:</span>
                <span className="font-semibold text-slate-200">{ticket.author?.fullName || 'User'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Assignee:</span>
                <span className="font-semibold text-slate-200">{ticket.assignee?.fullName || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Status:</span>
                <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'}>{ticket.status}</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-slate-300">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
