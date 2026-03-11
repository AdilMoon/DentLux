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
  phone?: string;
  avatarUrl?: string | null;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  ARRIVED = 'ARRIVED',
  VISITED = 'VISITED',
  MISSED = 'MISSED',
  COMPLETED = 'COMPLETED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Күтілуде',
  [AppointmentStatus.ARRIVED]: 'Келді',
  [AppointmentStatus.VISITED]: 'Келді',
  [AppointmentStatus.MISSED]: 'Келмеді',
  [AppointmentStatus.COMPLETED]: 'Ем жасалды',
  [AppointmentStatus.DONE]: 'Аяқталды',
  [AppointmentStatus.CANCELLED]: 'Күшін жойылды',
};

export interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  experienceYears?: number;
  workSchedule?: any;
  avatarUrl?: string | null;
  isBlocked?: boolean;
  blockedUntil?: string | null;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  date: string; // для обратной совместимости
  time: string; // для обратной совместимости
  status: AppointmentStatus;
  notes?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Күтілуде',
  [PaymentStatus.PAID]: 'Төленді',
  [PaymentStatus.REFUNDED]: 'Қайтарылды',
};

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Қолма-қол ақша',
  [PaymentMethod.CARD]: 'Банк картасы',
};

export interface Payment {
  id: string;
  appointmentId: string;
  serviceName: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  clientName?: string;
  clientEmail?: string;
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const RefundStatusLabels: Record<RefundStatus, string> = {
  [RefundStatus.PENDING]: 'Күтілуде',
  [RefundStatus.APPROVED]: 'Бекітілді',
  [RefundStatus.REJECTED]: 'Бас тартылды',
};

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  serviceName?: string;
  clientName?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}
