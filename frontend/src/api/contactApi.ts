import apiClient from './apiClient';

export interface ContactMessageRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const contactApi = {
  submitMessage: async (data: ContactMessageRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },
};
