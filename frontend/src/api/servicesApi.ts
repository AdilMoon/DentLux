import apiClient from './apiClient';
import { Service } from '../types';

export interface ServiceResponse {
  success: boolean;
  data: Service | Service[];
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
}

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<ServiceResponse>('/services');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  create: async (data: CreateServiceRequest): Promise<Service> => {
    const response = await apiClient.post<ServiceResponse>('/services', data);
    return response.data.data as Service;
  },

  update: async (id: string, data: Partial<CreateServiceRequest>): Promise<Service> => {
    const response = await apiClient.patch<ServiceResponse>(`/services/${id}`, data);
    return response.data.data as Service;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
};
