import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Service, Doctor, Appointment } from '../types';

interface AppContextType {
  services: Service[];
  doctors: Doctor[];
  appointments: Appointment[];
  setServices: (services: Service[]) => void;
  setDoctors: (doctors: Doctor[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  refreshServices: () => Promise<void>;
  refreshDoctors: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const refreshServices = async () => {
    // Будет реализовано при интеграции с API
  };

  const refreshDoctors = async () => {
    // Будет реализовано при интеграции с API
  };

  const refreshAppointments = async () => {
    // Будет реализовано при интеграции с API
  };

  const value: AppContextType = {
    services,
    doctors,
    appointments,
    setServices,
    setDoctors,
    setAppointments,
    refreshServices,
    refreshDoctors,
    refreshAppointments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
