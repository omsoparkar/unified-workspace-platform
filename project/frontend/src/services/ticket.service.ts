import { apiClient } from './api.client';
import { Ticket, TicketComment, Attachment, TicketStatus, TicketPriority } from '../types';

export interface ListTicketsParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export const ticketService = {
  async listTickets(params?: ListTicketsParams): Promise<{ tickets: Ticket[]; meta: { totalRecords: number } }> {
    const res = await apiClient.get('/tickets', { params });
    const data = res.data.data;
    if (Array.isArray(data)) {
      return { tickets: data, meta: { totalRecords: data.length } };
    }
    return { tickets: data.tickets || [], meta: data.meta || { totalRecords: (data.tickets || []).length } };
  },

  async getTicketById(id: string): Promise<Ticket> {
    const res = await apiClient.get(`/tickets/${id}`);
    return res.data.data;
  },

  async createTicket(data: { title: string; description: string; priority?: TicketPriority }): Promise<Ticket> {
    const res = await apiClient.post('/tickets', data);
    return res.data.data;
  },

  async updateTicket(id: string, data: Partial<{ title: string; description: string; priority: TicketPriority; status: TicketStatus }>): Promise<Ticket> {
    const res = await apiClient.patch(`/tickets/${id}`, data);
    return res.data.data;
  },

  async changeStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const res = await apiClient.patch(`/tickets/${id}/status`, { status });
    return res.data.data;
  },

  async assignTicket(id: string, assigneeId: string): Promise<Ticket> {
    const res = await apiClient.patch(`/tickets/${id}/assign`, { assigneeId });
    return res.data.data;
  },

  async addComment(id: string, content: string): Promise<TicketComment> {
    const res = await apiClient.post(`/tickets/${id}/comments`, { content });
    return res.data.data;
  },

  async listComments(id: string): Promise<TicketComment[]> {
    const res = await apiClient.get(`/tickets/${id}/comments`);
    return res.data.data;
  },

  async addAttachment(id: string, fileData: { fileName: string; fileUrl: string; fileSize: number }): Promise<Attachment> {
    const res = await apiClient.post(`/tickets/${id}/attachments`, fileData);
    return res.data.data;
  },
};
