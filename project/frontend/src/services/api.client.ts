import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const activeOrgId = localStorage.getItem('activeOrgId');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (activeOrgId) {
        config.headers['x-org-id'] = activeOrgId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Don't redirect automatically on login attempts
      if (!error.config.url?.includes('/auth/login') && !error.config.url?.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('activeOrgId');
      }
    }
    return Promise.reject(error);
  }
);
