import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import Card from '../components/Card';
import DataTable, { Column } from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import FormInput from '../components/FormInput';
import {
  Users,
  Stethoscope,
  Scissors,
  CalendarCheck,
  CreditCard,
  RotateCcw,
  TrendingUp,
  Download,
  LogOut,
  Wallet,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Camera,
  User,
  Ban,
  Unlock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import {
  clientsApi,
  doctorsApi,
  servicesApi,
  appointmentsApi,
  paymentsApi,
  refundsApi,
  expensesApi,
  analyticsApi,
  ExpenseCategory,
} from '../api';
import { clientBlocksApi, ClientBlock } from '../api/clientBlocksApi';
import {
  Doctor,
  Service,
  Appointment,
  Payment,
  Refund,
  Expense,
  AppointmentStatus,
  AppointmentStatusLabels,
  PaymentStatus,
  PaymentStatusLabels,
  PaymentMethod,
  PaymentMethodLabels,
  RefundStatus,
  RefundStatusLabels,
} from '../types';

// Схема валидации для клиента (такая же как в регистрации)
const registerSchema = z.object({
  fullName: z.string().min(2, 'Аты-жөні кемінде 2 символ болуы керек'),
  email: z
    .string()
    .min(1, 'Email міндетті')
    .email('Email дұрыс емес')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(9, 'Құпиясөз кемінде 9 символ болуы керек')
    .refine(
      (val) => {
        const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
        const digits = (val.match(/\d/g) || []).length;
        const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        return letters >= 6 && digits >= 2 && special >= 1;
      },
      {
        message: 'Құпиясөз кемінде 6 әріп, 2 сан және 1 арнайы символ болуы керек',
      }
    ),
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Нөмір +7-ден басталып, 10 саннан тұруы керек (мысалы: +77001234567)')
    .optional()
    .or(z.literal('')),
  specialization: z.string().min(1, 'Мамандығы міндетті'),
  experienceYears: z.coerce.number().int().min(0).max(100).optional().or(z.nan().transform(() => undefined)),
});

type ViewType = 'clients' | 'doctors' | 'services' | 'appointments' | 'payments' | 'refunds' | 'expenses' | 'analytics' | 'blocks';

// Специализации докторов (стоматология)
const DOCTOR_SPECIALIZATIONS = [
  'Терапевт',
  'Хирург',
  'Ортодонт',
  'Ортопед',
  'Пародонтолог',
  'Эндодонт',
  'Балалар стоматологы',
  'Имплантолог',
  'Протезист',
  'Гигиенист',
];

// Схема валидации для доктора (используется динамически в компоненте)
const createDoctorSchema = (isEdit: boolean) => z.object({
  fullName: z.string().min(2, 'Аты-жөні кемінде 2 символ болуы керек'),
  email: z
    .string()
    .min(1, 'Email міндетті')
    .email('Email дұрыс емес')
    .toLowerCase()
    .trim(),
  password: isEdit
    ? z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val || val.length === 0) return true;
            if (val.length < 9) return false;
            const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
            const digits = (val.match(/\d/g) || []).length;
            const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
            return letters >= 6 && digits >= 2 && special >= 1;
          },
          {
            message: 'Құпиясөз кемінде 9 символ, 6 әріп, 2 сан және 1 арнайы символ болуы керек',
          }
        )
    : z
        .string()
        .min(9, 'Құпиясөз кемінде 9 символ болуы керек')
        .refine(
          (val) => {
            const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
            const digits = (val.match(/\d/g) || []).length;
            const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
            return letters >= 6 && digits >= 2 && special >= 1;
          },
          {
            message: 'Құпиясөз кемінде 6 әріп, 2 сан және 1 арнайы символ болуы керек',
          }
        ),
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Нөмір +7-ден басталып, 10 саннан тұруы керек (мысалы: +77001234567)')
    .optional()
    .or(z.literal('')),
  specialization: z.string().min(1, 'Мамандығы міндетті'),
  experienceYears: z.coerce.number().int().min(0).max(100).optional().or(z.nan().transform(() => undefined)),
});

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('analytics');

  // Data states
  const [clients, setClients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<ClientBlock[]>([]);

  // Loading states
  const [loading, setLoading] = useState<Record<ViewType, boolean>>({
    clients: false,
    doctors: false,
    services: false,
    appointments: false,
    payments: false,
    refunds: false,
    expenses: false,
    analytics: false,
    blocks: false,
  });

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<Record<ViewType, number>>({
    clients: 1,
    doctors: 1,
    services: 1,
    appointments: 1,
    payments: 1,
    refunds: 1,
    expenses: 1,
    analytics: 1,
  });
  const itemsPerPage = 10;

  // Date range for analytics
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Search states for different views
  const [searchQueries, setSearchQueries] = useState<Record<ViewType, string>>({
    clients: '',
    doctors: '',
    services: '',
    appointments: '',
    payments: '',
    refunds: '',
    expenses: '',
    analytics: '',
    blocks: '',
  });

  useEffect(() => {
    loadData(currentView);
  }, [currentView]);

  const loadData = async (view: ViewType) => {
    setLoading((prev) => ({ ...prev, [view]: true }));
    try {
      switch (view) {
        case 'clients':
          const clientsData = await clientsApi.getAll();
          setClients(clientsData);
          break;
        case 'doctors':
          const doctorsData = await doctorsApi.getAll();
          setDoctors(doctorsData);
          break;
        case 'services':
          const servicesData = await servicesApi.getAll();
          setServices(servicesData);
          break;
        case 'appointments':
          const appointmentsData = await appointmentsApi.getAll();
          setAppointments(appointmentsData);
          break;
        case 'payments':
          const [paymentsData, pendingPaymentsData] = await Promise.all([
            paymentsApi.getAll(),
            paymentsApi.getPending(),
          ]);
          setPayments(paymentsData);
          setPendingPayments(pendingPaymentsData || []);
          break;
        case 'refunds':
          const refundsData = await refundsApi.getAll();
          setRefunds(refundsData);
          break;
        case 'expenses':
          const expensesData = await expensesApi.getAll();
          setExpenses(expensesData);
          break;
        case 'blocks':
          const blocksData = await clientBlocksApi.getActiveBlocks();
          setBlocks(blocksData);
          break;
        case 'analytics':
          const [analyticsData, dailyStatsData] = await Promise.all([
            analyticsApi.getFinance(startDate, endDate),
            analyticsApi.getDaily(startDate, endDate),
          ]);
          setAnalytics(analyticsData);
          setDailyStats(dailyStatsData);
          break;
      }
    } catch (error) {
      toast.error(`Деректерді жүктеу қатесі: ${view}`);
    } finally {
      setLoading((prev) => ({ ...prev, [view]: false }));
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await analyticsApi.exportExcel(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Excel файлы жүктелді');
    } catch (error) {
      toast.error('Экспорт қатесі');
    }
  };

  const handleCreateExpense = async (data: any) => {
    try {
      await expensesApi.create(data);
      toast.success('Шығын қосылды');
      setShowExpenseModal(false);
      loadData('expenses');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Шығын құру қатесі');
    }
  };

  const handleUpdateRefund = async (id: string, status: RefundStatus) => {
    try {
      await refundsApi.update(id, { status });
      toast.success('Қайтарым статусы жаңартылды');
      setShowRefundModal(false);
      setSelectedRefund(null);
      loadData('refunds');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Жаңарту қатесі');
    }
  };

  const handleCreateService = async (data: any) => {
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, data);
        toast.success('Қызмет жаңартылды');
      } else {
        await servicesApi.create(data);
        toast.success('Қызмет қосылды');
      }
      setShowServiceModal(false);
      setEditingService(null);
      loadData('services');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Қызметті сақтау қатесі');
    }
  };

  const handleCreateDoctor = async (data: any) => {
    try {

      const doctorData = {
        email: data.email,
        password: data.password || undefined,
        fullName: data.fullName,
        phone: data.phone || undefined,
        specialization: data.specialization,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears.toString()) : undefined,
      };

      if (editingDoctor) {
        await doctorsApi.update(editingDoctor.id, doctorData);
        toast.success('Дәрігер жаңартылды');
      } else {
        await doctorsApi.create(doctorData);
        toast.success('Дәрігер қосылды');
      }
      setShowDoctorModal(false);
      setEditingDoctor(null);
      loadData('doctors');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Дәрігерді сақтау қатесі');
    }
  };

  const handleCreateClient = async (data: any) => {
    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id, data);
        toast.success('Пайдаланушы жаңартылды');
      } else {
        await clientsApi.create(data);
        toast.success('Пайдаланушы қосылды');
      }
      setShowClientModal(false);
      setEditingClient(null);
      loadData('clients');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Пайдаланушыны сақтау қатесі');
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    try {
      await doctorsApi.delete(doctorToDelete.id);
      toast.success('Дәрігер жойылды');
      setConfirmDeleteDialogOpen(false);
      setDoctorToDelete(null);
      loadData('doctors');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Дәрігерді жою қатесі');
    }
  };

  const menuItems = [
    { id: 'clients' as ViewType, icon: Users, label: 'Клиенттер' },
    { id: 'doctors' as ViewType, icon: Stethoscope, label: 'Дәрігерлер' },
    { id: 'services' as ViewType, icon: Scissors, label: 'Қызметтер' },
    { id: 'appointments' as ViewType, icon: CalendarCheck, label: 'Жазылулар' },
    { id: 'payments' as ViewType, icon: CreditCard, label: 'Төлемдер' },
    { id: 'refunds' as ViewType, icon: RotateCcw, label: 'Қайтарымдар' },
    { id: 'expenses' as ViewType, icon: Wallet, label: 'Шығындар' },
    { id: 'blocks' as ViewType, icon: Ban, label: 'Блокировки' },
    { id: 'analytics' as ViewType, icon: TrendingUp, label: 'Аналитика' },
  ];

  const renderContent = () => {
    if (loading[currentView]) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} />
          ))}
        </div>
      );
    }

    // Helper function to filter data by search query
    const filterBySearch = <T extends Record<string, any>>(data: T[], query: string, searchFields: (keyof T)[]): T[] => {
      if (!query.trim()) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(lowerQuery);
        })
      );
    };

    switch (currentView) {
      case 'clients':
        const filteredClients = filterBySearch(clients, searchQueries.clients, ['name', 'email', 'phone']);
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Клиенттерді іздеу..."
                  value={searchQueries.clients}
                  onChange={(e) => setSearchQueries(prev => ({ ...prev, clients: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <Button onClick={() => setShowClientModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Клиент қосу
              </Button>
            </div>
            <Card>
              {clients.length === 0 ? (
                <EmptyState icon={Users} title="Пайдаланушылар жоқ" />
              ) : filteredClients.length === 0 ? (
                <EmptyState icon={Users} title="Клиенттер табылмады" />
              ) : (
                <DataTable
                  data={filteredClients}
                  columns={[
                    { key: 'name', header: 'Аты-жөні', sortable: true },
                    { key: 'email', header: 'Email', sortable: true },
                    { key: 'phone', header: 'Телефон', sortable: true },
                    {
                      key: 'actions',
                      header: 'Әрекет',
                      render: (item) => (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingClient(item);
                              setShowClientModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              const reason = prompt('Блоктау себебін енгізіңіз:');
                              if (!reason) return;
                              try {
                                await clientBlocksApi.blockClient(item.id, reason);
                                toast.success('Клиент блокталды');
                                loadData('clients');
                                loadData('blocks');
                              } catch (error: any) {
                                toast.error(error?.response?.data?.error || 'Блоктау қатесі');
                              }
                            }}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'doctors':
        const filteredDoctors = filterBySearch(doctors, searchQueries.doctors, ['name', 'specialization', 'email']);
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Дәрігерлерді іздеу..."
                  value={searchQueries.doctors}
                  onChange={(e) => setSearchQueries(prev => ({ ...prev, doctors: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <Button onClick={() => setShowDoctorModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Дәрігер қосу
              </Button>
            </div>
            <Card>
              {doctors.length === 0 ? (
                <EmptyState icon={Stethoscope} title="Дәрігерлер жоқ" />
              ) : filteredDoctors.length === 0 ? (
                <EmptyState icon={Stethoscope} title="Дәрігерлер табылмады" />
              ) : (
                <DataTable
                  data={filteredDoctors}
                  columns={[
                    { key: 'name', header: 'Аты-жөні', sortable: true },
                    { key: 'email', header: 'Email', sortable: true },
                    { key: 'specialization', header: 'Мамандығы', sortable: true },
                    {
                      key: 'experienceYears',
                      header: 'Тәжірибе',
                      sortable: true,
                      render: (item) => item.experienceYears ? `${item.experienceYears} жыл` : '-',
                    },
                    {
                      key: 'status',
                      header: 'Статус',
                      render: (item) => (
                        item.isBlocked ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Блокталған
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Белсенді
                          </span>
                        )
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Әрекет',
                      render: (item) => (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingDoctor(item);
                              setShowDoctorModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {item.isBlocked ? (
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={async () => {
                                try {
                                  await doctorsApi.unblockDoctor(item.id);
                                  toast.success('Дәрігер разблокирован');
                                  loadData('doctors');
                                } catch (error: any) {
                                  toast.error(error?.response?.data?.error || 'Разблокировка қатесі');
                                }
                              }}
                              title="Разблокировать доктора"
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Разблокировать
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={async () => {
                                try {
                                  await doctorsApi.blockDoctor(item.id);
                                  toast.success('Дәрігер блокталды');
                                  loadData('doctors');
                                } catch (error: any) {
                                  toast.error(error?.response?.data?.error || 'Блоктау қатесі');
                                }
                              }}
                              title="Заблокировать доктора"
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Заблокировать
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setDoctorToDelete(item);
                              setConfirmDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'services':
        const filteredServices = filterBySearch(services, searchQueries.services, ['name', 'description']);
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Қызметтерді іздеу..."
                  value={searchQueries.services}
                  onChange={(e) => setSearchQueries(prev => ({ ...prev, services: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <Button onClick={() => setShowServiceModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Қызмет қосу
              </Button>
            </div>
            <Card>
              {services.length === 0 ? (
                <EmptyState icon={Scissors} title="Қызметтер жоқ" />
              ) : filteredServices.length === 0 ? (
                <EmptyState icon={Scissors} title="Қызметтер табылмады" />
              ) : (
                <DataTable
                  data={filteredServices}
                  columns={[
                    { key: 'name', header: 'Атауы', sortable: true },
                    {
                      key: 'price',
                      header: 'Бағасы',
                      sortable: true,
                      render: (item) => `${item.price.toLocaleString()} ₸`,
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'appointments':
        const filteredAppointments = filterBySearch(appointments, searchQueries.appointments, ['clientName', 'doctorName', 'serviceName']);
        return (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Жазылуларды іздеу..."
                value={searchQueries.appointments}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, appointments: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <Card>
              {appointments.length === 0 ? (
                <EmptyState icon={CalendarCheck} title="Жазылулар жоқ" />
              ) : filteredAppointments.length === 0 ? (
                <EmptyState icon={CalendarCheck} title="Жазылулар табылмады" />
              ) : (
                <DataTable
                  data={filteredAppointments}
                  columns={[
                    { key: 'clientName', header: 'Клиент', sortable: true },
                    { key: 'doctorName', header: 'Дәрігер', sortable: true },
                    { key: 'serviceName', header: 'Қызмет', sortable: true },
                    { key: 'date', header: 'Күні', sortable: true },
                    { key: 'time', header: 'Уақыты', sortable: true },
                    {
                      key: 'status',
                      header: 'Статусы',
                      render: (item) => (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {AppointmentStatusLabels[item.status] || item.status}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'payments':
        const filteredPayments = filterBySearch(payments, searchQueries.payments, ['serviceName', 'date']);
        return (
          <div className="space-y-4">
            {/* Ожидающие подтверждения платежи */}
            {pendingPayments.length > 0 && (
              <Card title="Төлемдерді растау күтілуде">
                <DataTable
                  data={pendingPayments}
                  columns={[
                    { key: 'serviceName', header: 'Қызмет', sortable: true },
                    { key: 'clientName', header: 'Клиент', sortable: true },
                    { key: 'date', header: 'Уақыты', sortable: true },
                    {
                      key: 'amount',
                      header: 'Сома',
                      sortable: true,
                      render: (item) => `${item.amount.toLocaleString()} ₸`,
                    },
                    {
                      key: 'paymentMethod',
                      header: 'Төлем түрі',
                      render: (item) => (
                        <span className="text-sm text-gray-600">
                          {item.paymentMethod === 'CASH' ? 'Қолма-қол ақша' : 'Банк картасы'}
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Әрекет',
                      render: (item) => (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={async () => {
                              try {
                                await paymentsApi.confirm(item.id);
                                toast.success('Төлем расталды');
                                loadData('payments');
                              } catch (error: any) {
                                toast.error(error?.response?.data?.error || 'Растау қатесі');
                              }
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Растау
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              if (!confirm(`Клиентті "${item.clientName}" блоктағыңыз келе ме?`)) return;
                              try {
                                const { clientBlocksApi } = await import('../api/clientBlocksApi');
                                await clientBlocksApi.blockClient(item.clientId, 'Келмеді (төлем расталмады)', item.appointmentId);
                                toast.success('Клиент блокталды');
                                loadData('payments');
                              } catch (error: any) {
                                toast.error(error?.response?.data?.error || 'Блоктау қатесі');
                              }
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Блоктау
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Төлемдерді іздеу..."
                value={searchQueries.payments}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, payments: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <Card title="Барлық төлемдер">
              {payments.length === 0 ? (
                <EmptyState icon={CreditCard} title="Төлемдер жоқ" />
              ) : filteredPayments.length === 0 ? (
                <EmptyState icon={CreditCard} title="Төлемдер табылмады" />
              ) : (
                <DataTable
                  data={filteredPayments}
                  columns={[
                    { key: 'serviceName', header: 'Қызмет', sortable: true },
                    { key: 'date', header: 'Уақыты', sortable: true },
                    {
                      key: 'amount',
                      header: 'Сома',
                      sortable: true,
                      render: (item) => `${item.amount.toLocaleString()} ₸`,
                    },
                    {
                      key: 'status',
                      header: 'Статусы',
                      render: (item) => (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === PaymentStatus.PAID
                            ? 'bg-green-100 text-green-700'
                            : item.status === PaymentStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {PaymentStatusLabels[item.status as PaymentStatus] || item.status}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'refunds':
        return (
          <Card>
            {refunds.length === 0 ? (
              <EmptyState icon={RotateCcw} title="Қайтарымдар жоқ" />
            ) : (
              <DataTable
                data={refunds}
                columns={[
                  { key: 'clientName', header: 'Клиент', sortable: true },
                  { key: 'serviceName', header: 'Қызмет', sortable: true },
                  {
                    key: 'amount',
                    header: 'Сома',
                    sortable: true,
                    render: (item) => `${item.amount.toLocaleString()} ₸`,
                  },
                  { key: 'reason', header: 'Себебі', sortable: false },
                  {
                    key: 'status',
                    header: 'Статусы',
                    render: (item) => (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === RefundStatus.APPROVED
                            ? 'bg-green-100 text-green-700'
                            : item.status === RefundStatus.REJECTED
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {RefundStatusLabels[item.status]}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    header: 'Әрекет',
                    render: (item) =>
                      item.status === RefundStatus.PENDING ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setSelectedRefund(item);
                              setShowRefundModal(true);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : null,
                  },
                ]}
              />
            )}
          </Card>
        );

      case 'expenses':
        return (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowExpenseModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Шығын қосу
              </Button>
            </div>
            <Card>
              {expenses.length === 0 ? (
                <EmptyState icon={Wallet} title="Шығындар жоқ" />
              ) : (
                <DataTable
                  data={expenses}
                  columns={[
                    { key: 'description', header: 'Сипаттама', sortable: true },
                    {
                      key: 'amount',
                      header: 'Сома',
                      sortable: true,
                      render: (item) => `${item.amount.toLocaleString()} ₸`,
                    },
                    { key: 'category', header: 'Санат', sortable: true },
                    { key: 'date', header: 'Күні', sortable: true },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'blocks':
        const filteredBlocks = filterBySearch(blocks, searchQueries.blocks || '', ['clientName', 'clientEmail', 'reason']);
        return (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Блокировки іздеу..."
                value={searchQueries.blocks || ''}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, blocks: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <Card title="Активные блокировки клиентов">
              {blocks.length === 0 ? (
                <EmptyState icon={Ban} title="Активные блокировки жоқ" />
              ) : filteredBlocks.length === 0 ? (
                <EmptyState icon={Ban} title="Блокировки табылмады" />
              ) : (
                <DataTable
                  data={filteredBlocks}
                  columns={[
                    { key: 'clientName', header: 'Клиент', sortable: true },
                    { key: 'clientEmail', header: 'Email', sortable: true },
                    {
                      key: 'reason',
                      header: 'Себебі',
                      render: (item) => item.reason || 'Себебі көрсетілмеген',
                    },
                    {
                      key: 'blockedByName',
                      header: 'Блоктаған',
                      render: (item) => item.blockedByName || '-',
                    },
                    {
                      key: 'createdAt',
                      header: 'Блокталған уақыты',
                      sortable: true,
                      render: (item) => new Date(item.createdAt).toLocaleString('kk-KZ'),
                    },
                    {
                      key: 'actions',
                      header: 'Әрекет',
                      render: (item) => (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={async () => {
                            try {
                              await clientBlocksApi.unblockClient(item.id);
                              toast.success('Клиент разблокирован');
                              loadData('blocks');
                            } catch (error: any) {
                              toast.error(error?.response?.data?.error || 'Разблокировка қатесі');
                            }
                          }}
                        >
                          <Unlock className="w-4 h-4 mr-1" />
                          Разблокировать
                        </Button>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        );

      case 'analytics':
        if (!analytics) {
          return <EmptyState icon={TrendingUp} title="Аналитика жоқ" />;
        }

        // Форматируем дневную статистику для графиков
        const formatDateForChart = (dateString: string) => {
          const date = new Date(dateString);
          const dayNames = ['Жек', 'Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен'];
          const dayName = dayNames[date.getDay()];
          const day = date.getDate();
          const month = date.getMonth() + 1;
          return `${dayName} ${day}.${month}`;
        };

        const chartData = dailyStats.length > 0 
          ? dailyStats.map((day: any) => ({
              name: formatDateForChart(day.date),
              табыс: day.revenue,
              шығын: day.expenses,
              пайда: day.profit,
            }))
          : [
              // Если нет данных, показываем пустой график
              { name: 'Деректер жоқ', табыс: 0, шығын: 0, пайда: 0 },
            ];

        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Басталу күні</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    loadData('analytics');
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Аяқталу күні</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    loadData('analytics');
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Жалпы Табыс',
                  value: `${analytics.totalRevenue.toLocaleString()} ₸`,
                  color: 'text-blue-600',
                },
                {
                  label: 'Шығындар',
                  value: `${analytics.totalExpenses.toLocaleString()} ₸`,
                  color: 'text-red-600',
                },
                {
                  label: 'Таза Пайда',
                  value: `${analytics.netProfit.toLocaleString()} ₸`,
                  color: 'text-green-600',
                },
                {
                  label: 'Қайтарымдар',
                  value: `${analytics.totalRefunds.toLocaleString()} ₸`,
                  color: 'text-gray-600',
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <h4 className={`text-xl font-bold ${stat.color}`}>{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Апталық табыс пен шығын</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        cursor={{ fill: '#F9FAFB' }}
                      />
                      <Bar dataKey="табыс" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={32} />
                      <Bar dataKey="шығын" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Пайда динамикасы</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="пайда"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorProfit)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-gray-50 dark:bg-primary-950 transition-colors">
      <aside className="w-72 bg-white dark:bg-primary-900 border-r-4 border-primary-900 dark:border-primary-800 flex flex-col shrink-0 transition-colors">
        <div className="p-8 border-b-4 border-primary-900 dark:border-primary-800">
          <div className="mb-6">
            <BackButton to="/" variant="ghost" size="sm" className="dark:text-primary-100" />
          </div>
          <h1 className="text-3xl font-black text-primary-900 dark:text-white uppercase tracking-tighter italic">
            DentLux<span className="text-accent-600">.</span>
          </h1>
          <p className="text-[10px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest mt-1">Админ панелі</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-6 py-4 transition-all group border-2 ${
                currentView === item.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]'
                  : 'text-primary-600 dark:text-primary-400 border-transparent hover:border-primary-900 dark:hover:border-primary-100 hover:text-primary-900 dark:hover:text-primary-100'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-4 ${currentView === item.id ? 'text-white' : 'text-primary-400 dark:text-primary-600 group-hover:text-blue-600 transition-colors'}`} />
              <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t-4 border-primary-900 dark:border-primary-800">
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-4 bg-primary-900 dark:bg-primary-950 text-white hover:bg-red-600 transition-all font-black uppercase tracking-widest text-xs border-2 border-primary-900 dark:border-primary-800"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Шығу
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b-4 border-primary-900 dark:border-primary-800 pb-6">
            <div>
              <h2 className="text-5xl font-black text-primary-900 dark:text-white uppercase tracking-tighter italic">
                {menuItems.find((m) => m.id === currentView)?.label}<span className="text-accent-600">.</span>
              </h2>
              <p className="text-primary-500 dark:text-primary-400 font-bold uppercase tracking-widest text-xs mt-2 italic">Клиниканың қазіргі жағдайы мен статистикасы</p>
            </div>
            {currentView === 'analytics' && (
              <Button 
                variant="secondary" 
                size="md" 
                onClick={handleExportExcel}
                className="bg-primary-900 text-white border-primary-900 hover:bg-white hover:text-primary-900 dark:border-primary-700"
              >
                <Download className="w-4 h-4 mr-2" /> EXCEL ЖҮКТЕУ
              </Button>
            )}
          </div>

          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateExpense}
        expense={editingExpense}
      />

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedRefund(null);
        }}
        refund={selectedRefund}
        onApprove={() => selectedRefund && handleUpdateRefund(selectedRefund.id, RefundStatus.APPROVED)}
        onReject={() => selectedRefund && handleUpdateRefund(selectedRefund.id, RefundStatus.REJECTED)}
      />

      {/* Service Modal */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        onSubmit={handleCreateService}
        service={editingService}
      />

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={showDoctorModal}
        onClose={() => {
          setShowDoctorModal(false);
          setEditingDoctor(null);
        }}
        onSubmit={handleCreateDoctor}
        doctor={editingDoctor}
        onAvatarUpload={async (doctorId, file) => {
          await doctorsApi.uploadAvatar(doctorId, file);
          toast.success('Фото сәтті жүктелді');
          loadData('doctors');
          // Обновляем editingDoctor с новыми данными
          const updatedDoctors = await doctorsApi.getAll();
          const updatedDoctor = updatedDoctors.find(d => d.id === doctorId);
          if (updatedDoctor) {
            setEditingDoctor(updatedDoctor);
          }
        }}
      />

      {/* Client Modal */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setEditingClient(null);
        }}
        onSubmit={handleCreateClient}
        client={editingClient}
      />

      {/* Confirm Delete Doctor Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteDialogOpen}
        onClose={() => {
          setConfirmDeleteDialogOpen(false);
          setDoctorToDelete(null);
        }}
        onConfirm={handleDeleteDoctor}
        title="Дәрігерді жою"
        message={`Сіз шынымен "${doctorToDelete?.name}" дәрігерін жойғыңыз келе ме? Бұл әрекетті қайтаруға болмайды.`}
        confirmText="Иә, жою"
        cancelText="Жоқ"
        variant="danger"
      />
    </div>
  );
};

// Expense Modal Component
const ExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  expense: Expense | null;
}> = ({ isOpen, onClose, onSubmit, expense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description);
      setDate(expense.date);
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Шығын қосу" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сома</label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Санат</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          >
            {Object.values(ExpenseCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сипаттама</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Күні</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Бас тарту
          </Button>
          <Button type="submit">Сақтау</Button>
        </div>
      </form>
    </Modal>
  );
};

// Refund Modal Component
const RefundModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  refund: Refund | null;
  onApprove: () => void;
  onReject: () => void;
}> = ({ isOpen, onClose, refund, onApprove, onReject }) => {
  if (!refund) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Қайтарымды басқару" size="md">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Клиент</p>
          <p className="font-semibold">{refund.clientName || 'Жоқ'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Қызмет</p>
          <p className="font-semibold">{refund.serviceName || 'Жоқ'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Сома</p>
          <p className="font-semibold">{refund.amount.toLocaleString()} ₸</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Себебі</p>
          <p className="font-semibold">{refund.reason}</p>
        </div>
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="danger" onClick={onReject}>
            <X className="w-4 h-4 mr-2" /> Бас тарту
          </Button>
          <Button variant="success" onClick={onApprove}>
            <Check className="w-4 h-4 mr-2" /> Бекіту
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Doctor Modal Component
const DoctorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  doctor: Doctor | null;
  onAvatarUpload?: (doctorId: string, file: File) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit, doctor, onAvatarUpload }) => {
  const doctorSchema = createDoctorSchema(!!doctor);
  type DoctorFormData = z.infer<typeof doctorSchema>;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  const methods = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experienceYears: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (doctor) {
      reset({
        fullName: doctor.name,
        email: doctor.email || '',
        password: '', // Не показываем пароль при редактировании
        phone: doctor.phone || '',
        specialization: doctor.specialization === 'Не указано' ? '' : (doctor.specialization || ''),
        experienceYears: doctor.experienceYears || undefined,
      });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experienceYears: undefined,
      });
    }
  }, [doctor, reset, isOpen]);

  // Обработчик для форматирования телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('7') && value.length > 0) {
      value = '7' + value;
    }
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    const formattedValue = value ? '+7' + value.slice(1) : '';
    onChange(formattedValue);
  };

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!doctor || !onAvatarUpload) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Тек сурет файлдарын жүктеуге болады');
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл өлшемі 5MB-тан аспауы керек');
      return;
    }

    try {
      setIsUploading(true);
      await onAvatarUpload(doctor.id, file);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Фото жүктеу қатесі';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doctor ? 'Дәрігерді өңдеу' : 'Дәрігер қосу'} size="md">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Фото доктора (только при редактировании) */}
          {doctor && (
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                  {doctor.avatarUrl ? (
                    <img 
                      src={`${API_BASE_URL.replace('/api', '')}${doctor.avatarUrl}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                  title="Фото жүктеу"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
          
          <FormInput
            name="fullName"
            label="Аты-жөні"
            type="text"
            placeholder="Мұрат Болат"
          />
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөз {doctor && '(өзгертпеу үшін бос қалдырыңыз)'}
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                  {!doctor && (
                    <p className="text-xs text-gray-500 mt-1">
                      Кемінде 9 символ, 6 әріп, 2 сан және 1 арнайы символ
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="tel"
                    placeholder="+77001234567"
                    maxLength={12}
                    onChange={(e) => handlePhoneChange(e, field.onChange)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Формат: +7XXXXXXXXXX (12 символ)
                  </p>
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мамандығы</label>
            <Controller
              name="specialization"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <select
                    {...field}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  >
                    <option value="">Мамандықты таңдаңыз</option>
                    {DOCTOR_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тәжірибе (жыл)</label>
            <Controller
              name="experienceYears"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Мысалы: 5"
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : e.target.value;
                      field.onChange(value);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Бас тарту
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {doctor ? 'Жаңарту' : 'Қосу'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

// Service Modal Component
const ServiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  service: Service | null;
}> = ({ isOpen, onClose, onSubmit, service }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setDurationMinutes((service as any).durationMinutes?.toString() || '30');
      setPrice(service.price.toString());
    } else {
      setName('');
      setDescription('');
      setDurationMinutes('30');
      setPrice('');
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      durationMinutes: parseInt(durationMinutes),
      price: parseFloat(price),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Қызметті өңдеу' : 'Қызмет қосу'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Атауы</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сипаттама</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ұзақтығы (минут)</label>
          <input
            type="number"
            required
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Бағасы (₸)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Бас тарту
          </Button>
          <Button type="submit">{service ? 'Жаңарту' : 'Қосу'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// Client Modal Component
const ClientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  client: any | null;
}> = ({ isOpen, onClose, onSubmit, client }) => {
  // Схема валидации для клиента (пароль опционален при редактировании)
  const clientSchema = z.object({
    fullName: z.string().min(2, 'Аты-жөні кемінде 2 символ болуы керек'),
    email: z
      .string()
      .min(1, 'Email міндетті')
      .email('Email дұрыс емес')
      .toLowerCase()
      .trim(),
    password: client
      ? z
          .string()
          .optional()
          .refine(
            (val) => {
              if (!val || val.length === 0) return true;
              if (val.length < 9) return false;
              const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
              const digits = (val.match(/\d/g) || []).length;
              const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
              return letters >= 6 && digits >= 2 && special >= 1;
            },
            {
              message: 'Құпиясөз кемінде 9 символ, 6 әріп, 2 сан және 1 арнайы символ болуы керек',
            }
          )
      : z
          .string()
          .min(9, 'Құпиясөз кемінде 9 символ болуы керек')
          .refine(
            (val) => {
              const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
              const digits = (val.match(/\d/g) || []).length;
              const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
              return letters >= 6 && digits >= 2 && special >= 1;
            },
            {
              message: 'Құпиясөз кемінде 6 әріп, 2 сан және 1 арнайы символ болуы керек',
            }
          ),
    phone: z
      .string()
      .regex(/^\+7\d{10}$/, 'Нөмір +7-ден басталып, 10 саннан тұруы керек (мысалы: +77001234567)'),
  });

  const methods = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (client) {
      reset({
        fullName: client.name || '',
        email: client.email || '',
        password: '',
        phone: client.phone || '',
      });
    } else {
      reset({
        fullName: '',
        email: '',
        password: '',
        phone: '',
      });
    }
  }, [client, reset, isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('7') && value.length > 0) {
      value = '7' + value;
    }
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    const formattedValue = value ? '+7' + value.slice(1) : '';
    onChange(formattedValue);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Пайдаланушыны өңдеу' : 'Пайдаланушы қосу'} size="md">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="fullName"
            label="Аты-жөні"
            type="text"
            placeholder="Мұрат Болат"
          />
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Құпиясөз {client && '(өзгертпеу үшін бос қалдырыңыз)'}
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    required={!client}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                  {!client && (
                    <p className="text-xs text-gray-500 mt-1">
                      Кемінде 9 символ, 6 әріп, 2 сан және 1 арнайы символ
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="tel"
                    placeholder="+77001234567"
                    maxLength={12}
                    onChange={(e) => handlePhoneChange(e, field.onChange)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                    }`}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {error.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Формат: +7XXXXXXXXXX (12 символ)
                  </p>
                </>
              )}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Бас тарту
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {client ? 'Жаңарту' : 'Қосу'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AdminDashboard;
