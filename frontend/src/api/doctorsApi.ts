import apiClient from './apiClient';
import { Doctor } from '../types';

export interface DoctorResponse {
  success: boolean;
  data: Doctor | Doctor[];
}

export interface CreateDoctorRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  specialization?: string;
  experienceYears?: number;
  workSchedule?: any;
}

export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<DoctorResponse>('/doctors');
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  },

  create: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const response = await apiClient.post<DoctorResponse>('/doctors', data);
    return response.data.data as Doctor;
  },

  update: async (id: string, data: Partial<CreateDoctorRequest>): Promise<Doctor> => {
    const response = await apiClient.patch<DoctorResponse>(`/doctors/${id}`, data);
    return response.data.data as Doctor;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  },

  uploadAvatar: async (id: string, file: File): Promise<Doctor> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<DoctorResponse>(`/doctors/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data as Doctor;
  },

  blockDoctor: async (id: string, blockedUntil?: string): Promise<Doctor> => {
    const response = await apiClient.post<DoctorResponse>(`/doctors/${id}/block`, { blockedUntil });
    return response.data.data as Doctor;
  },

  unblockDoctor: async (id: string): Promise<Doctor> => {
    const response = await apiClient.post<DoctorResponse>(`/doctors/${id}/unblock`);
    return response.data.data as Doctor;
  },
};
