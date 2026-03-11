import apiClient from './apiClient';
import { Appointment, AppointmentStatus } from '../types';

export interface CreateAppointmentRequest {
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

export interface AppointmentResponse {
  success: boolean;
  data: Appointment | Appointment[];
}

export interface UpdateStatusRequest {
  status: AppointmentStatus;
}

export const appointmentsApi = {
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post<AppointmentResponse>('/appointments', data);
    return response.data.data as Appointment;
  },

  getMy: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentResponse>('/appointments/my');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  getDoctorAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentResponse>('/appointments/doctor');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  getAll: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<AppointmentResponse>('/appointments');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  updateStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
    const response = await apiClient.patch<AppointmentResponse>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data.data as Appointment;
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },
};
