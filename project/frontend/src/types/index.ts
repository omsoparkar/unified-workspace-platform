// User & Identity Types
export type UserRole = 'USER' | 'SUPPORT_AGENT' | 'SUPPORT_MANAGER' | 'REVIEWER_APPROVER' | 'ORG_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  orgId: string;
  role: UserRole;
  org: Organization;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  activeOrg: Organization;
  memberships: Membership[];
}

// Ticket Types
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  orgId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  authorId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  assignee?: User;
  comments?: TicketComment[];
  attachments?: Attachment[];
}

// PR Types
export type PRStatus = 'OPEN' | 'APPROVED' | 'CHANGES_REQUESTED' | 'MERGED' | 'CLOSED';
export type VoteDecision = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';

export interface CodeReviewVote {
  id: string;
  prId: string;
  voterId: string;
  decision: VoteDecision;
  feedback?: string;
  createdAt: string;
  voter: User;
}

export interface PRVersion {
  id: string;
  prId: string;
  versionNumber: number;
  commitHash: string;
  diffSummary: string;
  createdAt: string;
}

export interface PRComment {
  id: string;
  prId: string;
  authorId: string;
  content: string;
  filePath?: string;
  lineNumber?: number;
  createdAt: string;
  author: User;
}

export interface CodeReviewPR {
  id: string;
  prNumber: number;
  orgId: string;
  title: string;
  description: string;
  status: PRStatus;
  requiredApprovals: number;
  currentApprovals: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  votes?: CodeReviewVote[];
  versions?: PRVersion[];
  comments?: PRComment[];
}

// Cross-Org Types
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface ConnectionRequest {
  id: string;
  requesterOrgId: string;
  targetOrgId: string;
  status: ConnectionStatus;
  createdAt: string;
  requesterOrg?: Organization;
  targetOrg?: Organization;
}

export interface SharedResource {
  id: string;
  sourceOrgId: string;
  targetOrgId: string;
  resourceType: string;
  resourceId: string;
  permission: 'READ' | 'WRITE' | 'FULL';
  createdAt: string;
  sourceOrg?: Organization;
  targetOrg?: Organization;
}

// Audit Types
export interface AuditLogEntry {
  id: string;
  orgId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  payload: Record<string, any>;
  previousHash: string;
  currentHash: string;
  timestamp: string;
  actor?: User;
}

export interface AuditVerificationResult {
  isValid: boolean;
  totalLogs: number;
  tamperedLogId?: string;
  message: string;
}

// AI Digest Types
export interface DigestReport {
  id: string;
  orgId: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  keyAchievements: string[];
  blockersIdentified: string[];
  actionItems: string[];
  createdAt: string;
}

// Notification Types
export interface NotificationItem {
  id: string;
  userId: string;
  orgId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
