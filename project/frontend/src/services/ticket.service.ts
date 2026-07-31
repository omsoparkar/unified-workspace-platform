import { apiClient } from './api.client';
import { Ticket, TicketComment, Attachment, TicketStatus, TicketPriority } from '../types';

export interface ListTicketsParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

const STORAGE_KEY = 'unified_workspace_tickets';
const COMMENTS_KEY = 'unified_workspace_ticket_comments';

const initialMockTickets: Ticket[] = [
  {
    id: 't-101',
    ticketNumber: 1,
    orgId: 'org-acme',
    title: 'Unable to connect to partner API endpoint',
    description: 'Received HTTP 500 error when attempting to fetch cross-organization shared resource payload.',
    status: 'OPEN',
    priority: 'HIGH',
    authorId: 'u-1',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    author: { id: 'u-1', fullName: 'Jane Doe', email: 'jane@acme.com', createdAt: '', updatedAt: '' },
  },
  {
    id: 't-102',
    ticketNumber: 2,
    orgId: 'org-acme',
    title: 'Audit log SHA-256 verification alert',
    description: 'Security audit flag raised regarding unexpected log sequence mismatch.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    authorId: 'u-2',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: { id: 'u-2', fullName: 'Alex Smith', email: 'alex@acme.com', createdAt: '', updatedAt: '' },
  },
];

function getStoredTickets(): Ticket[] {
  if (typeof window === 'undefined') return initialMockTickets;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockTickets));
    return initialMockTickets;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialMockTickets;
  }
}

function saveStoredTickets(tickets: Ticket[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
}

function getStoredComments(ticketId: string): TicketComment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`${COMMENTS_KEY}_${ticketId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveStoredComments(ticketId: string, comments: TicketComment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${COMMENTS_KEY}_${ticketId}`, JSON.stringify(comments));
  }
}

export const ticketService = {
  async listTickets(params?: ListTicketsParams): Promise<{ tickets: Ticket[]; meta: { totalRecords: number } }> {
    try {
      const res = await apiClient.get('/tickets', { params });
      const data = res.data.data;
      if (Array.isArray(data)) {
        return { tickets: data, meta: { totalRecords: data.length } };
      }
      return { tickets: data.tickets || [], meta: data.meta || { totalRecords: (data.tickets || []).length } };
    } catch (err) {
      console.warn('Backend API unreachable, using local storage tickets');
      let tickets = getStoredTickets();
      if (params?.search) {
        const q = params.search.toLowerCase();
        tickets = tickets.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.ticketNumber.toString().includes(q)
        );
      }
      if (params?.status) {
        tickets = tickets.filter((t) => t.status === params.status);
      }
      return { tickets, meta: { totalRecords: tickets.length } };
    }
  },

  async getTicketById(id: string): Promise<Ticket> {
    try {
      const res = await apiClient.get(`/tickets/${id}`);
      return res.data.data;
    } catch (err) {
      const tickets = getStoredTickets();
      const ticket = tickets.find((t) => t.id === id || t.ticketNumber.toString() === id);
      if (ticket) return ticket;
      return tickets[0];
    }
  },

  async createTicket(data: { title: string; description: string; priority?: TicketPriority }): Promise<Ticket> {
    try {
      const res = await apiClient.post('/tickets', data);
      return res.data.data;
    } catch (err) {
      const tickets = getStoredTickets();
      const newTicket: Ticket = {
        id: `t-${Date.now()}`,
        ticketNumber: tickets.length + 1,
        orgId: 'org-acme',
        title: data.title,
        description: data.description,
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
        authorId: 'u-current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { id: 'u-current', fullName: 'Current User', email: 'user@acme.com', createdAt: '', updatedAt: '' },
      };
      tickets.unshift(newTicket);
      saveStoredTickets(tickets);
      return newTicket;
    }
  },

  async updateTicket(
    id: string,
    data: Partial<{ title: string; description: string; priority: TicketPriority; status: TicketStatus }>
  ): Promise<Ticket> {
    try {
      const res = await apiClient.patch(`/tickets/${id}`, data);
      return res.data.data;
    } catch (err) {
      const tickets = getStoredTickets();
      const idx = tickets.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tickets[idx] = { ...tickets[idx], ...data, updatedAt: new Date().toISOString() };
        saveStoredTickets(tickets);
        return tickets[idx];
      }
      throw err;
    }
  },

  async changeStatus(id: string, status: TicketStatus): Promise<Ticket> {
    try {
      const res = await apiClient.patch(`/tickets/${id}/status`, { status });
      return res.data.data;
    } catch (err) {
      return this.updateTicket(id, { status });
    }
  },

  async assignTicket(id: string, assigneeId: string): Promise<Ticket> {
    try {
      const res = await apiClient.patch(`/tickets/${id}/assign`, { assigneeId });
      return res.data.data;
    } catch (err) {
      const tickets = getStoredTickets();
      const idx = tickets.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tickets[idx].assigneeId = assigneeId;
        saveStoredTickets(tickets);
        return tickets[idx];
      }
      throw err;
    }
  },

  async addComment(id: string, content: string): Promise<TicketComment> {
    try {
      const res = await apiClient.post(`/tickets/${id}/comments`, { content });
      return res.data.data;
    } catch (err) {
      const comments = getStoredComments(id);
      const newComment: TicketComment = {
        id: `tc-${Date.now()}`,
        ticketId: id,
        authorId: 'u-current',
        content,
        createdAt: new Date().toISOString(),
        author: { id: 'u-current', fullName: 'Current User', email: 'user@acme.com', createdAt: '', updatedAt: '' },
      };
      comments.push(newComment);
      saveStoredComments(id, comments);
      return newComment;
    }
  },

  async listComments(id: string): Promise<TicketComment[]> {
    try {
      const res = await apiClient.get(`/tickets/${id}/comments`);
      return res.data.data;
    } catch (err) {
      return getStoredComments(id);
    }
  },

  async addAttachment(
    id: string,
    fileData: { fileName: string; fileUrl: string; fileSize: number }
  ): Promise<Attachment> {
    try {
      const res = await apiClient.post(`/tickets/${id}/attachments`, fileData);
      return res.data.data;
    } catch (err) {
      return {
        id: `att-${Date.now()}`,
        ticketId: id,
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        uploadedAt: new Date().toISOString(),
      };
    }
  },
};
