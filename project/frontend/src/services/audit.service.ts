import { apiClient } from './api.client';
import { AuditLogEntry, AuditVerificationResult } from '../types';

export interface ListAuditParams {
  search?: string;
  action?: string;
  resourceType?: string;
  page?: number;
  limit?: number;
}

export const auditService = {
  async listAuditLogs(params?: ListAuditParams): Promise<{ logs: AuditLogEntry[]; meta: { totalRecords: number } }> {
    const res = await apiClient.get('/audit', { params });
    const data = res.data.data;
    if (Array.isArray(data)) {
      return { logs: data, meta: { totalRecords: data.length } };
    }
    return { logs: data.logs || [], meta: data.meta || { totalRecords: (data.logs || []).length } };
  },

  async getTimeline(params?: ListAuditParams): Promise<AuditLogEntry[]> {
    const res = await apiClient.get('/audit/timeline', { params });
    return res.data.data;
  },

  async verifyHashChain(): Promise<AuditVerificationResult> {
    const res = await apiClient.get('/audit/verify');
    return res.data.data;
  },

  async exportAuditCSV(): Promise<Blob> {
    const res = await apiClient.get('/audit/export', { responseType: 'blob' });
    return res.data;
  },
};
