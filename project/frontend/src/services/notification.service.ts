import { apiClient } from './api.client';
import { NotificationItem } from '../types';

export const notificationService = {
  async listNotifications(): Promise<NotificationItem[]> {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
