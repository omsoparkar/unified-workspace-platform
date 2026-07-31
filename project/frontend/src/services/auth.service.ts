import { apiClient } from './api.client';
import { User, Organization, Membership, AuthResponse } from '../types';

export const authService = {
  async register(data: { email: string; password: string; fullName: string; orgName: string }): Promise<AuthResponse> {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  async getCurrentUser(): Promise<{ user: User; activeOrg: Organization; memberships: Membership[] }> {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },

  async switchOrg(orgId: string): Promise<{ activeOrg: Organization; token: string }> {
    const res = await apiClient.post('/auth/switch-org', { orgId });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
