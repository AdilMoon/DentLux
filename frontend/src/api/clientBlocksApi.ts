import apiClient from './apiClient';

export interface ClientBlock {
  id: string;
  clientId: string;
  clientName: string | null;
  clientEmail: string | null;
  blockedBy: string;
  blockedByName: string | null;
  reason: string | null;
  appointmentId: string | null;
  isActive: boolean;
  createdAt: string;
  unblockedAt: string | null;
  unblockedBy: string | null;
  unblockedByName: string | null;
}

export const clientBlocksApi = {
  getActiveBlocks: async (): Promise<ClientBlock[]> => {
    const response = await apiClient.get<{ success: boolean; data: ClientBlock[] }>('/client-blocks/active');
    return response.data.data;
  },

  getClientBlocks: async (clientId: string): Promise<ClientBlock[]> => {
    const response = await apiClient.get<{ success: boolean; data: ClientBlock[] }>(`/client-blocks/client/${clientId}`);
    return response.data.data;
  },

  blockClient: async (clientId: string, reason?: string, appointmentId?: string): Promise<ClientBlock> => {
    const response = await apiClient.post<{ success: boolean; data: ClientBlock }>(
      `/client-blocks/${clientId}/block`,
      { reason, appointmentId }
    );
    return response.data.data;
  },

  unblockClient: async (blockId: string): Promise<ClientBlock> => {
    const response = await apiClient.patch<{ success: boolean; data: ClientBlock }>(`/client-blocks/${blockId}/unblock`);
    return response.data.data;
  },

  checkBlockStatus: async (clientId?: string): Promise<{ isBlocked: boolean }> => {
    const url = clientId ? `/client-blocks/check/${clientId}` : '/client-blocks/check';
    const response = await apiClient.get<{ success: boolean; data: { isBlocked: boolean } }>(url);
    return response.data.data;
  },
};
