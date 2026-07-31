import { apiClient } from './api.client';
import { CodeReviewPR, PRStatus, VoteDecision, PRVersion, PRComment } from '../types';

export interface ListPRsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const STORAGE_KEY = 'unified_workspace_prs';
const COMMENTS_KEY = 'unified_workspace_pr_comments';

const initialMockPRs: CodeReviewPR[] = [
  {
    id: 'pr-101',
    prNumber: 1,
    orgId: 'org-acme',
    title: 'feat: Implement SHA-256 Hash Chain verification endpoint',
    description: 'Adds cryptographic verification for audit logs ensuring tamper-evident history integrity.',
    status: 'OPEN',
    requiredApprovals: 2,
    currentApprovals: 1,
    authorId: 'u-1',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: { id: 'u-1', fullName: 'Jane Doe', email: 'jane@acme.com', createdAt: '', updatedAt: '' },
  },
  {
    id: 'pr-102',
    prNumber: 2,
    orgId: 'org-acme',
    title: 'fix: Multi-tenant header validation in tenant context middleware',
    description: 'Ensures x-org-id header is properly sanitized and matched against user organization memberships.',
    status: 'APPROVED',
    requiredApprovals: 2,
    currentApprovals: 2,
    authorId: 'u-2',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    author: { id: 'u-2', fullName: 'Alex Smith', email: 'alex@acme.com', createdAt: '', updatedAt: '' },
  },
];

function getStoredPRs(): CodeReviewPR[] {
  if (typeof window === 'undefined') return initialMockPRs;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockPRs));
    return initialMockPRs;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialMockPRs;
  }
}

function saveStoredPRs(prs: CodeReviewPR[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prs));
  }
}

function getStoredPRComments(prId: string): PRComment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`${COMMENTS_KEY}_${prId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveStoredPRComments(prId: string, comments: PRComment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${COMMENTS_KEY}_${prId}`, JSON.stringify(comments));
  }
}

export const prService = {
  async listPRs(params?: ListPRsParams): Promise<{ prs: CodeReviewPR[]; meta: { totalRecords: number } }> {
    try {
      const res = await apiClient.get('/prs', { params });
      const data = res.data.data;
      if (Array.isArray(data)) {
        return { prs: data, meta: { totalRecords: data.length } };
      }
      return { prs: data.prs || [], meta: data.meta || { totalRecords: (data.prs || []).length } };
    } catch (err) {
      console.warn('Backend API unreachable, using local storage PRs');
      let prs = getStoredPRs();
      if (params?.search) {
        const q = params.search.toLowerCase();
        prs = prs.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.prNumber.toString().includes(q)
        );
      }
      if (params?.status) {
        prs = prs.filter((p) => p.status === params.status);
      }
      return { prs, meta: { totalRecords: prs.length } };
    }
  },

  async getPRById(id: string): Promise<CodeReviewPR> {
    try {
      const res = await apiClient.get(`/prs/${id}`);
      return res.data.data;
    } catch (err) {
      const prs = getStoredPRs();
      const pr = prs.find((p) => p.id === id || p.prNumber.toString() === id);
      if (pr) return pr;
      return prs[0];
    }
  },

  async createPR(data: { title: string; description: string; requiredApprovals?: number }): Promise<CodeReviewPR> {
    try {
      const res = await apiClient.post('/prs', data);
      return res.data.data;
    } catch (err) {
      const prs = getStoredPRs();
      const newPR: CodeReviewPR = {
        id: `pr-${Date.now()}`,
        prNumber: prs.length + 1,
        orgId: 'org-acme',
        title: data.title,
        description: data.description,
        status: 'OPEN',
        requiredApprovals: data.requiredApprovals || 2,
        currentApprovals: 0,
        authorId: 'u-current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { id: 'u-current', fullName: 'Current User', email: 'user@acme.com', createdAt: '', updatedAt: '' },
      };
      prs.unshift(newPR);
      saveStoredPRs(prs);
      return newPR;
    }
  },

  async approvePR(id: string, feedback?: string): Promise<CodeReviewPR> {
    try {
      const res = await apiClient.patch(`/prs/${id}/approve`, { feedback });
      return res.data.data;
    } catch (err) {
      const prs = getStoredPRs();
      const idx = prs.findIndex((p) => p.id === id);
      if (idx !== -1) {
        prs[idx].currentApprovals += 1;
        if (prs[idx].currentApprovals >= prs[idx].requiredApprovals) {
          prs[idx].status = 'APPROVED';
        }
        saveStoredPRs(prs);
        return prs[idx];
      }
      throw err;
    }
  },

  async requestChangesPR(id: string, feedback: string): Promise<CodeReviewPR> {
    try {
      const res = await apiClient.patch(`/prs/${id}/request-changes`, { feedback });
      return res.data.data;
    } catch (err) {
      const prs = getStoredPRs();
      const idx = prs.findIndex((p) => p.id === id);
      if (idx !== -1) {
        prs[idx].status = 'CHANGES_REQUESTED';
        saveStoredPRs(prs);
        return prs[idx];
      }
      throw err;
    }
  },

  async mergePR(id: string): Promise<CodeReviewPR> {
    try {
      const res = await apiClient.patch(`/prs/${id}/merge`);
      return res.data.data;
    } catch (err) {
      const prs = getStoredPRs();
      const idx = prs.findIndex((p) => p.id === id);
      if (idx !== -1) {
        prs[idx].status = 'MERGED';
        saveStoredPRs(prs);
        return prs[idx];
      }
      throw err;
    }
  },

  async getPRVersions(id: string): Promise<PRVersion[]> {
    try {
      const res = await apiClient.get(`/prs/${id}/versions`);
      return res.data.data;
    } catch (err) {
      return [
        {
          id: `v1-${id}`,
          prId: id,
          versionNumber: 1,
          commitHash: 'a1b2c3d4e5f6',
          diffSummary: '+15 lines, -3 lines',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getPRVersionDiff(
    id: string,
    versionNumber: number
  ): Promise<{ diff: string; oldVersion: number; newVersion: number }> {
    try {
      const res = await apiClient.get(`/prs/${id}/versions/${versionNumber}/diff`);
      return res.data.data;
    } catch (err) {
      return {
        diff: `--- a/src/core/crypto/hash-chain.service.ts\n+++ b/src/core/crypto/hash-chain.service.ts\n@@ -12,6 +12,9 @@\n export class HashChainService {\n-  public calculateHash(prev: string): string {\n+  public calculateHash(prev: string, payload: Record<string, any>): string {\n+    const payloadStr = JSON.stringify(payload);\n+    return crypto.createHash('sha256').update(prev + payloadStr).digest('hex');\n   }\n }`,
        oldVersion: versionNumber - 1,
        newVersion: versionNumber,
      };
    }
  },

  async addComment(id: string, data: { content: string; filePath?: string; lineNumber?: number }): Promise<PRComment> {
    try {
      const res = await apiClient.post(`/prs/${id}/comments`, data);
      return res.data.data;
    } catch (err) {
      const comments = getStoredPRComments(id);
      const newComment: PRComment = {
        id: `prc-${Date.now()}`,
        prId: id,
        authorId: 'u-current',
        content: data.content,
        filePath: data.filePath,
        lineNumber: data.lineNumber,
        createdAt: new Date().toISOString(),
        author: { id: 'u-current', fullName: 'Current User', email: 'user@acme.com', createdAt: '', updatedAt: '' },
      };
      comments.push(newComment);
      saveStoredPRComments(id, comments);
      return newComment;
    }
  },
};
