import apiClient from './apiClient';
import { Payment } from '../types';

export interface PaymentResponse {
  success: boolean;
  data: Payment | Payment[];
}

export const paymentsApi = {
  create: async (appointmentId: string, data?: { paymentMethod?: 'CARD' | 'CASH' }): Promise<Payment> => {
    const response = await apiClient.post<PaymentResponse>(`/payments/${appointmentId}`, data || {});
    return response.data.data as Payment;
  },

  getMy: async (): Promise<Payment[]> => {
    const response = await apiClient.get<PaymentResponse>('/payments/my');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get<PaymentResponse>('/payments');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  downloadReceipt: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/payments/${id}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getPending: async (): Promise<Payment[]> => {
    const response = await apiClient.get<PaymentResponse>('/payments/pending');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  confirm: async (id: string): Promise<Payment> => {
    const response = await apiClient.patch<PaymentResponse>(`/payments/${id}/confirm`);
    return response.data.data as Payment;
  },
};
