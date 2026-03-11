
export enum UserRole {
  CLIENT = 'CLIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum AppointmentStatus {
  PENDING = 'Күтілуде',
  ARRIVED = 'Келді',
  MISSED = 'Келмеді',
  COMPLETED = 'Ем жасалды'
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface Payment {
  id: string;
  serviceName: string;
  amount: number;
  date: string;
  status: 'Төленді' | 'Қайтарылды' | 'Күтілуде';
}
