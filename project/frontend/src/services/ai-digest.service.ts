import { apiClient } from './api.client';
import { DigestReport } from '../types';

export const aiDigestService = {
  async generateDigest(periodDays?: number): Promise<{ jobId: string; message: string }> {
    const res = await apiClient.post('/ai/generate', { periodDays: periodDays || 7 });
    return res.data.data;
  },

  async listDigests(): Promise<DigestReport[]> {
    const res = await apiClient.get('/ai/digests');
    return res.data.data;
  },

  async getDigestById(id: string): Promise<DigestReport> {
    const res = await apiClient.get(`/ai/digests/${id}`);
    return res.data.data;
  },
};
