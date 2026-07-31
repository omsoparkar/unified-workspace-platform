'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.listNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time alerts for PR review votes, ticket updates & partner handshakes</p>
        </div>
        <Button variant="outline" size="sm" className="space-x-1.5" onClick={() => markAllReadMutation.mutate()}>
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>Mark All as Read</span>
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader title="Notifications" subtitle={`Showing ${notifications.length} alerts`} />

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No notifications yet. You're all caught up!</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`py-3.5 flex items-center justify-between p-3 rounded-xl transition-all ${
                  !n.read ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-100">{n.title}</span>
                    {!n.read && <Badge variant="primary">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-400">{n.message}</p>
                  <p className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="text-slate-400 hover:text-emerald-400"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
