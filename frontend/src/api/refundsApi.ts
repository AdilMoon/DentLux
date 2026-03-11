import apiClient from './apiClient';
import { RefundStatus } from '../types';

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  serviceName?: string;
  clientName?: string;
}

export interface CreateRefundRequest {
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  data: Refund | Refund[];
}

export interface UpdateRefundRequest {
  status: RefundStatus;
}

export const refundsApi = {
  create: async (paymentId: string, data: CreateRefundRequest): Promise<Refund> => {
    const response = await apiClient.post<RefundResponse>(`/refunds/${paymentId}`, data);
    return response.data.data as Refund;
  },

  getMy: async (): Promise<Refund[]> => {
    const response = await apiClient.get<RefundResponse>('/refunds/my');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  getAll: async (): Promise<Refund[]> => {
    const response = await apiClient.get<RefundResponse>('/refunds');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  update: async (id: string, data: UpdateRefundRequest): Promise<Refund> => {
    const response = await apiClient.patch<RefundResponse>(`/refunds/${id}`, data);
    return response.data.data as Refund;
  },
};
