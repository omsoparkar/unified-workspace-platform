import { apiClient } from './api.client';
import { ConnectionRequest, SharedResource } from '../types';

export const crossOrgService = {
  async listConnections(): Promise<ConnectionRequest[]> {
    const res = await apiClient.get('/cross-org/connections');
    return res.data.data;
  },

  async requestConnection(targetOrgSlug: string): Promise<ConnectionRequest> {
    const res = await apiClient.post('/cross-org/connections', { targetOrgSlug });
    return res.data.data;
  },

  async acceptConnection(id: string): Promise<ConnectionRequest> {
    const res = await apiClient.patch(`/cross-org/connections/${id}/accept`);
    return res.data.data;
  },

  async rejectConnection(id: string): Promise<ConnectionRequest> {
    const res = await apiClient.patch(`/cross-org/connections/${id}/reject`);
    return res.data.data;
  },

  async listSharedResources(): Promise<SharedResource[]> {
    const res = await apiClient.get('/cross-org/resources');
    return res.data.data;
  },

  async shareResource(data: { targetOrgId: string; resourceType: string; resourceId: string; permission: string }): Promise<SharedResource> {
    const res = await apiClient.post('/cross-org/resources', data);
    return res.data.data;
  },
};
