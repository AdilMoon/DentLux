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

export interface CalendarDay {
  date: string;
  working: boolean;
  freeSlotCount: number;
  hasAvailability: boolean;
}

export interface AvailabilityCalendarResponse {
  doctorId: string;
  startDate: string;
  days: number;
  calendar: CalendarDay[];
}

export const scheduleApi = {
  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlots> => {
    const response = await apiClient.get(`/schedule/doctors/${doctorId}/available-slots`, {
      params: { date },
    });
    return response.data.data;
  },

  getAvailabilityCalendar: async (
    doctorId: string,
    start: string,
    days = 35,
  ): Promise<AvailabilityCalendarResponse> => {
    const response = await apiClient.get(`/schedule/doctors/${doctorId}/availability-calendar`, {
      params: { start, days },
    });
    return response.data.data;
  },
};
