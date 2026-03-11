import apiClient from './apiClient';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<Profile> => {
    const response = await apiClient.patch('/profile', data);
    return response.data.data;
  },

  uploadAvatar: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<{ success: boolean; data: Profile }>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
