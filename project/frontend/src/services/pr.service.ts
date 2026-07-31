import { apiClient } from './api.client';
import { CodeReviewPR, PRStatus, VoteDecision, PRVersion, PRComment } from '../types';

export interface ListPRsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const prService = {
  async listPRs(params?: ListPRsParams): Promise<{ prs: CodeReviewPR[]; meta: { totalRecords: number } }> {
    const res = await apiClient.get('/prs', { params });
    const data = res.data.data;
    if (Array.isArray(data)) {
      return { prs: data, meta: { totalRecords: data.length } };
    }
    return { prs: data.prs || [], meta: data.meta || { totalRecords: (data.prs || []).length } };
  },

  async getPRById(id: string): Promise<CodeReviewPR> {
    const res = await apiClient.get(`/prs/${id}`);
    return res.data.data;
  },

  async createPR(data: { title: string; description: string; requiredApprovals?: number }): Promise<CodeReviewPR> {
    const res = await apiClient.post('/prs', data);
    return res.data.data;
  },

  async approvePR(id: string, feedback?: string): Promise<CodeReviewPR> {
    const res = await apiClient.patch(`/prs/${id}/approve`, { feedback });
    return res.data.data;
  },

  async requestChangesPR(id: string, feedback: string): Promise<CodeReviewPR> {
    const res = await apiClient.patch(`/prs/${id}/request-changes`, { feedback });
    return res.data.data;
  },

  async mergePR(id: string): Promise<CodeReviewPR> {
    const res = await apiClient.patch(`/prs/${id}/merge`);
    return res.data.data;
  },

  async getPRVersions(id: string): Promise<PRVersion[]> {
    const res = await apiClient.get(`/prs/${id}/versions`);
    return res.data.data;
  },

  async getPRVersionDiff(id: string, versionNumber: number): Promise<{ diff: string; oldVersion: number; newVersion: number }> {
    const res = await apiClient.get(`/prs/${id}/versions/${versionNumber}/diff`);
    return res.data.data;
  },

  async addComment(id: string, data: { content: string; filePath?: string; lineNumber?: number }): Promise<PRComment> {
    const res = await apiClient.post(`/prs/${id}/comments`, data);
    return res.data.data;
  },
};
