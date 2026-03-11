import apiClient from './apiClient';
import { User, UserRole } from '../types/index';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    // Backend возвращает { success: true, token: ..., user: ... }
    const data = response.data;
    if (data.success && data.token && data.user) {
      return {
        success: data.success,
        token: data.token,
        user: data.user,
      };
    }
    throw new Error('Неверный формат ответа от сервера при входе');
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    // Backend возвращает { success: true, token: ..., user: ... }
    const responseData = response.data;
    if (responseData.success && responseData.token && responseData.user) {
      return {
        success: responseData.success,
        token: responseData.token,
        user: responseData.user,
      };
    }
    console.error('Неверный формат ответа от сервера:', responseData);
    throw new Error('Неверный формат ответа от сервера при регистрации');
  },

  logout: () => {
    localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'dentreserve_token');
    localStorage.removeItem('user');
  },
};
