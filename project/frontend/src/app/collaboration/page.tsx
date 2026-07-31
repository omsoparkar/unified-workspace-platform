'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crossOrgService } from '../../services/cross-org.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Network, Plus, CheckCircle2, XCircle, Share2, Building2 } from 'lucide-react';

export default function CollaborationPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlug, setTargetSlug] = useState('');

  const { data: connections = [], isLoading: connLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => crossOrgService.listConnections(),
  });

  const { data: resources = [], isLoading: resLoading } = useQuery({
    queryKey: ['shared-resources'],
    queryFn: () => crossOrgService.listSharedResources(),
  });

  const requestConnMutation = useMutation({
    mutationFn: (slug: string) => crossOrgService.requestConnection(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setIsModalOpen(false);
      setTargetSlug('');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => crossOrgService.acceptConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => crossOrgService.rejectConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Network className="w-6 h-6 text-blue-400" />
            <span>Cross-Organization Partner Collaboration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Partner connection handshakes & governed shared resources across tenant boundaries
          </p>
        </div>
        <Button variant="primary" size="sm" className="space-x-1.5" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Invite Partner Organization</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Connection Handshakes */}
        <Card>
          <CardHeader title="Partner Handshakes & Connections" subtitle="Active and pending partner relationships" />

          {connLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading partner connections...</span>
            </div>
          ) : connections.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No partner organization handshakes active yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {connections.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/40">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-slate-100">{c.targetOrg?.name || c.targetOrgId}</span>
                    </div>
                    <p className="text-xs text-slate-400">Initiated on {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={c.status === 'ACCEPTED' ? 'success' : c.status === 'PENDING' ? 'warning' : 'danger'}>
                      {c.status}
                    </Badge>
                    {c.status === 'PENDING' && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acceptMutation.mutate(c.id)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectMutation.mutate(c.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Shared Cross-Org Resources */}
        <Card>
          <CardHeader title="Governance & Shared Resources" subtitle="Cross-boundary assets with explicit permission policies" />

          {resLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading shared resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No resources currently shared cross-org.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {resources.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between p-3 rounded-xl hover:bg-slate-900/40">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-slate-100">{r.resourceType}</span>
                      <span className="font-mono text-xs text-slate-500">[{r.resourceId.substring(0, 8)}]</span>
                    </div>
                    <p className="text-xs text-slate-400">Target Org: {r.targetOrg?.name || r.targetOrgId}</p>
                  </div>
                  <Badge variant="info">Permission: {r.permission}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Connection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Partner Organization">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestConnMutation.mutate(targetSlug);
          }}
          className="space-y-4"
        >
          <Input
            label="Partner Organization Slug"
            placeholder="e.g., partner-corp"
            value={targetSlug}
            onChange={(e) => setTargetSlug(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={requestConnMutation.isPending}>
              Send Handshake Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
