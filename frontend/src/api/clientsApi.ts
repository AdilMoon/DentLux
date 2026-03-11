import apiClient from './apiClient';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface ClientResponse {
  success: boolean;
  data: Client | Client[];
}

export interface CreateClientRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get<ClientResponse>('/clients');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  create: async (data: CreateClientRequest): Promise<Client> => {
    const response = await apiClient.post<ClientResponse>('/clients', data);
    return response.data.data as Client;
  },

  update: async (id: string, data: Partial<CreateClientRequest>): Promise<Client> => {
    const response = await apiClient.patch<ClientResponse>(`/clients/${id}`, data);
    return response.data.data as Client;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};



