import apiClient from './apiClient';

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  clientId: string;
  doctorId: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  prescriptions?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    service: {
      id: string;
      name: string;
    };
  };
  client?: {
    id: string;
    fullName: string;
    email: string;
  };
  doctor?: {
    id: string;
    fullName: string;
  };
}

export interface MedicalRecordRequest {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  prescriptions?: string;
}

export const medicalRecordApi = {
  getByAppointmentId: async (appointmentId: string): Promise<MedicalRecord | null> => {
    const response = await apiClient.get(`/medical-records/appointments/${appointmentId}`);
    return response.data.data;
  },

  createOrUpdate: async (appointmentId: string, data: MedicalRecordRequest): Promise<MedicalRecord> => {
    const response = await apiClient.put(`/medical-records/appointments/${appointmentId}`, data);
    return response.data.data;
  },

  getPatientHistory: async (clientId: string): Promise<MedicalRecord[]> => {
    const response = await apiClient.get(`/medical-records/patients/${clientId}/history`);
    return response.data.data;
  },

  getMyRecords: async (): Promise<MedicalRecord[]> => {
    const response = await apiClient.get('/medical-records/my-records');
    return response.data.data;
  },

  downloadPDF: async (appointmentId: string): Promise<void> => {
    const response = await apiClient.get(`/medical-records/appointments/${appointmentId}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `treatment-plan-${appointmentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
