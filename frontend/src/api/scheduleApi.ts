import apiClient from './apiClient';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlots {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
  availableSlots: string[]; // Для обратной совместимости
}

export const scheduleApi = {
  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlots> => {
    const response = await apiClient.get(`/schedule/doctors/${doctorId}/available-slots`, {
      params: { date },
    });
    return response.data.data;
  },
};
