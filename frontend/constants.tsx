
import { Service, Doctor, Appointment, AppointmentStatus, Payment } from './types';

export const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Тіс тазалау', price: 15000 },
  { id: '2', name: 'Пломба салу', price: 25000 },
  { id: '3', name: 'Тіс жұлу', price: 20000 },
  { id: '4', name: 'Имплантация', price: 250000 },
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Айдос Құмар', specialization: 'Терапевт' },
  { id: '2', name: 'Динара Серік', specialization: 'Хирург' },
  { id: '3', name: 'Мұрат Болат', specialization: 'Ортодонт' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    clientId: 'user-1',
    clientName: 'Азамат Сапаров',
    doctorId: '1',
    doctorName: 'Айдос Құмар',
    serviceId: '1',
    serviceName: 'Тіс тазалау',
    date: '2024-05-20',
    time: '10:00',
    status: AppointmentStatus.PENDING,
  },
  {
    id: 'app-2',
    clientId: 'user-2',
    clientName: 'Гүлім Нұрлан',
    doctorId: '2',
    doctorName: 'Динара Серік',
    serviceId: '2',
    serviceName: 'Пломба салу',
    date: '2024-05-20',
    time: '11:30',
    status: AppointmentStatus.COMPLETED,
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-1', serviceName: 'Пломба салу', amount: 25000, date: '2024-05-15 14:30', status: 'Төленді' },
  { id: 'pay-2', serviceName: 'Тіс тазалау', amount: 15000, date: '2024-05-12 10:00', status: 'Төленді' },
];
