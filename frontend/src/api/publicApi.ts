import apiClient from './apiClient';
import { Doctor } from '../types';
import { Service } from '../types';

// Публичные API функциялар (авторизация қажет емес)

export const publicApi = {
  // Барлық дәрігерлерді алу (басты бет үшін)
  async getPublicDoctors(): Promise<Doctor[]> {
    try {
      const response = await apiClient.get('/doctors');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Дәрігерлерді алу қатесі:', error);
      return [];
    }
  },

  // Барлық қызметтерді алу (басты бет үшін)
  async getPublicServices(): Promise<Service[]> {
    try {
      const response = await apiClient.get('/services');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Қызметтерді алу қатесі:', error);
      return [];
    }
  },
};

export default publicApi;


