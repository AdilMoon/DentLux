import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApi, LoginRequest, RegisterRequest } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'dentreserve_token';
const USER_KEY = 'dentreserve_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных при монтировании
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        // Если данные повреждены, очищаем
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Неверный формат ответа от сервера');
      }
      
      const { token: newToken, user: userData } = response;

      // Проверка обязательных полей
      if (!userData || !userData.id || !userData.email || !userData.role) {
        console.error('Ответ от сервера:', response);
        throw new Error('Неполные данные пользователя в ответе. Проверьте консоль для деталей.');
      }

      // Используем full_name или комбинируем firstName и lastName если они есть
      const fullName = userData.full_name || (userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}`.trim() 
        : userData.email);

      const user: User = {
        id: userData.id,
        name: fullName,
        email: userData.email,
        role: userData.role as UserRole,
        phone: userData.phone,
      };

      setToken(newToken);
      setUser(user);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Неверный формат ответа от сервера');
      }
      
      const { token: newToken, user: userData } = response;

      // Проверка обязательных полей
      if (!userData || !userData.id || !userData.email || !userData.role) {
        console.error('Ответ от сервера:', response);
        throw new Error('Неполные данные пользователя в ответе. Проверьте консоль для деталей.');
      }

      // Используем full_name или комбинируем firstName и lastName если они есть
      const fullName = userData.full_name || (userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}`.trim() 
        : userData.email);

      const user: User = {
        id: userData.id,
        name: fullName,
        email: userData.email,
        role: userData.role as UserRole,
        phone: userData.phone,
      };

      setToken(newToken);
      setUser(user);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
