import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';

// Поддержка обоих вариантов названия переменной
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Создаем экземпляр axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к запросам
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'dentreserve_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { error?: string; message?: string };

      switch (status) {
        case 401:
          // Неавторизован - очищаем токен и редиректим на логин
          localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'dentreserve_token');
          localStorage.removeItem('user');
          // Не показываем toast для 401, так как будет редирект
          // toast.error уже показывается в компонентах при необходимости
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        default:
          // Используем централизованную обработку ошибок
          const errorMessage = getErrorMessage(error);
          // Toast показываем только если это не 401 (он обрабатывается отдельно)
          // Но многие компоненты уже обрабатывают ошибки, поэтому здесь не показываем для всех
          // Можно показывать только для неожиданных ошибок
          if (status >= 500) {
            toast.error(errorMessage);
          }
      }
    } else if (error.request) {
      // Сетевая ошибка - нет ответа от сервера
      const errorMessage = getErrorMessage(error);
      // Не показываем toast здесь, пусть компоненты решают когда показывать
    } else {
      // Другая ошибка
      const errorMessage = getErrorMessage(error);
      // Не показываем toast здесь
    }

    return Promise.reject(error);
  }
);

export default apiClient;
