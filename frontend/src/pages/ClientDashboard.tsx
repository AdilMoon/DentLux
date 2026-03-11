import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { Calendar, Clock, LogOut, FileText, X, User, Mail, Phone, Briefcase, Award, Search, Filter, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { servicesApi, doctorsApi, appointmentsApi, paymentsApi, medicalRecordApi } from '../api';
import { scheduleApi } from '../api/scheduleApi';
import { reviewApi, Review } from '../api/reviewApi';
import { validateCardNumber, validateExpiry, validateCvv, formatCardNumber, formatExpiry } from '../utils/cardUtils';
import { Service, Doctor, Appointment, Payment, AppointmentStatus, AppointmentStatusLabels, PaymentStatus, PaymentStatusLabels, PaymentMethod, PaymentMethodLabels } from '../types';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'booking' | 'appointments' | 'payments'>('booking');
  
  // Booking state
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reset doctor selection when service changes
  useEffect(() => {
    if (selectedService) {
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setAvailableTimeSlots([]);
    }
  }, [selectedService]);

  // Load available time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableTimeSlots([]);
      setAllTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, selectedDate]);
  
  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Search and filter states
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [doctorSpecializationFilter, setDoctorSpecializationFilter] = useState<string>('');
  
  // Loading states
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Confirm dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  // Doctor profile modal
  const [doctorProfileOpen, setDoctorProfileOpen] = useState(false);
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<Doctor | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'history'>('active');

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [appointmentForPayment, setAppointmentForPayment] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [appointmentForReview, setAppointmentForReview] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [appointmentReviews, setAppointmentReviews] = useState<Map<string, Review>>(new Map());

  // Medical records state
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const data = await servicesApi.getAll();
        setServices(data);
      } catch (error) {
        toast.error('Қызметтерді жүктеу қатесі');
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const data = await doctorsApi.getAll();
        setDoctors(data);
      } catch (error) {
        toast.error('Дәрігерлерді жүктеу қатесі');
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  // Load appointments
  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
      loadMedicalRecords();
    }
  }, [activeTab]);

  const loadMedicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const data = await medicalRecordApi.getMyRecords();
      setMedicalRecords(data || []);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDownloadPDF = async (appointmentId: string) => {
    try {
      setDownloadingPdf(appointmentId);
      await medicalRecordApi.downloadPDF(appointmentId);
      toast.success('PDF жүктелді');
    } catch (error) {
      toast.error('PDF жүктеу қатесі');
    } finally {
      setDownloadingPdf(null);
    }
  };

  // Load payments
  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [activeTab]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const data = await appointmentsApi.getMy();
      // Преобразуем данные для совместимости
      const transformed = data.map((app: any) => ({
        ...app,
        date: app.appointmentDate || app.date,
        time: app.appointmentTime || app.time,
      }));
      setAppointments(transformed);
    } catch (error) {
      toast.error('Жазылуларды жүктеу қатесі');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const data = await paymentsApi.getMy();
      setPayments(data);
    } catch (error) {
      toast.error('Төлемдерді жүктеу қатесі');
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoadingSlots(true);
      // Получаем все временные слоты с информацией о доступности
      const result = await scheduleApi.getAvailableSlots(selectedDoctor, selectedDate);
      setAllTimeSlots(result.slots || []);
      setAvailableTimeSlots(result.availableSlots || []);
      
      // Если выбранное время больше не доступно, сбрасываем его
      if (selectedTime && !result.availableSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Уақыт слоттарын жүктеу қатесі';
      toast.error(errorMessage);
      setAvailableTimeSlots([]);
      setAllTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Барлық өрістерді толтырыңыз');
      return;
    }

    try {
      setBookingLoading(true);
      const appointment = await appointmentsApi.create({
        doctorId: selectedDoctor,
        serviceId: selectedService,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        notes: notes || undefined,
      });
      
      // Сохраняем данные для оплаты
      const appointmentId = (appointment as any).id;
      if (appointmentId) {
        const appointmentData = {
          id: appointmentId,
          serviceName: selectedServiceData?.name || '',
          servicePrice: selectedServiceData?.price || 0,
          doctorName: selectedDoctorData?.name || '',
          date: selectedDate,
          time: selectedTime,
        };
        
        setAppointmentForPayment(appointmentData);
        setPaymentModalOpen(true);
      }
      
      toast.success('Жазылу сәтті құрылды!');
      
      // Обновляем список доступных слотов, если доктор и дата все еще выбраны
      if (selectedDoctor && selectedDate) {
        await loadAvailableSlots();
      }
      
      // Reset form
      setSelectedService('');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Жазылу құру қатесі';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      await appointmentsApi.cancel(appointmentToCancel);
      toast.success('Жазылу күшін жойылды');
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      await loadAppointments();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Жазылуды болдырмау қатесі';
      toast.error(errorMessage);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await paymentsApi.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Түбіртек жүктелді');
    } catch (error) {
      toast.error('Түбіртек жүктеу қатесі');
    }
  };

  // Filtered services and doctors
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
  );

  const filteredDoctors = doctors.filter(doctor => {
    // Скрываем заблокированных докторов
    if (doctor.isBlocked) {
      // Если есть срок блокировки, проверяем, не истек ли он
      if (doctor.blockedUntil) {
        const blockedUntilDate = new Date(doctor.blockedUntil);
        if (blockedUntilDate > new Date()) {
          return false; // Все еще заблокирован
        }
      } else {
        return false; // Заблокирован без срока
      }
    }
    
    const matchesSearch = doctor.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(doctorSearchQuery.toLowerCase()));
    const matchesSpecialization = !doctorSpecializationFilter || doctor.specialization === doctorSpecializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations for filter
  const specializations = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  const handleViewDoctorProfile = (doctor: Doctor) => {
    setSelectedDoctorForProfile(doctor);
    setDoctorProfileOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!appointmentForPayment?.id) {
      toast.error('Жазылу ID табылмады');
      return;
    }

    // Валидация для карты
    if (paymentMethod === 'card') {
      if (!validateCardNumber(cardNumber)) {
        toast.error('Карта нөмірі 16 цифр болуы керек');
        return;
      }
      
      if (!validateExpiry(cardExpiry)) {
        toast.error('Картаның мерзімі дұрыс емес (MM/YY)');
        return;
      }
      
      if (!validateCvv(cardCvv)) {
        toast.error('CVV 3 цифр болуы керек');
        return;
      }
    }

    try {
      // Отправляем способ оплаты на бэкенд
      const paymentMethodValue = paymentMethod === 'card' ? 'CARD' : 'CASH';
      const response = await paymentsApi.create(appointmentForPayment.id, { 
        paymentMethod: paymentMethodValue
      });
      
      // Показываем соответствующее сообщение в зависимости от способа оплаты
      if (paymentMethodValue === 'CASH') {
        toast.success('Төлем құрылды. Растау күтілуде. Чек админ растағаннан кейін пайда болады.');
      } else {
        toast.success('Төлем сәтті құрылды!');
      }
      
      setPaymentModalOpen(false);
      setAppointmentForPayment(null);
      setPaymentMethod('card');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setActiveTab('payments');
      await loadPayments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Төлем құру қатесі');
    }
  };

  const handleSubmitReview = async () => {
    if (!appointmentForReview || reviewRating === 0) {
      toast.error('Рейтинг таңдаңыз');
      return;
    }

    try {
      setSubmittingReview(true);
      const review = await reviewApi.create({
        appointmentId: appointmentForReview.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      
      // Добавляем отзыв в Map
      setAppointmentReviews(prev => new Map(prev).set(appointmentForReview.id, review));
      
      toast.success('Пікір сәтті қосылды!');
      setReviewModalOpen(false);
      setAppointmentForReview(null);
      setReviewRating(0);
      setReviewComment('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Пікір қосу қатесі';
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <BackButton to="/" variant="ghost" />
          <div>
            <h1 className="text-xl font-bold text-blue-600">DentLux</h1>
            <p className="text-sm text-gray-500">Сәлеметсіз бе, {user?.name}!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Шығу
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('booking')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'booking' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Онлайн жазылу
            {activeTab === 'booking' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'appointments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Менің қабылдауларым
            {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'payments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Менің төлемдерім
            {activeTab === 'payments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
          </button>
        </div>

        {activeTab === 'booking' && (
          <div className="space-y-6">
              <Card title="1. Қызмет таңдау">
              {!loadingServices && services.length > 0 && (
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Қызметті іздеу..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-primary-900 rounded-none focus:bg-primary-50 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold uppercase tracking-widest text-xs"
                    />
                  </div>
                </div>
              )}
              {loadingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} height={100} />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
                  {serviceSearchQuery ? 'Қызметтер табылмады' : 'Қызметтер жоқ'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map(service => (
                    <div
                      key={service.id}
                      className={`p-6 border-2 transition-all cursor-pointer group ${
                        selectedService === service.id
                          ? 'border-blue-600 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]'
                          : 'border-primary-900 hover:border-blue-600'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <h4 className="font-black text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">{service.name}</h4>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-medium">{service.description}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-black tracking-tighter">{service.price.toLocaleString()} ₸</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.durationMinutes} мин</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </Card>

              {selectedService && (
                <Card title="2. Дәрігер таңдау">
                  {!loadingDoctors && doctors.length > 0 && (
                    <div className="mb-4 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Дәрігерді іздеу..."
                          value={doctorSearchQuery}
                          onChange={(e) => setDoctorSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-primary-900 rounded-none focus:bg-primary-50 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold uppercase tracking-widest text-xs"
                        />
                      </div>
                    </div>
                  )}
                  {loadingDoctors ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} height={80} />
                      ))}
                    </div>
                  ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
                      {doctorSearchQuery || doctorSpecializationFilter ? 'Дәрігерлер табылмады' : 'Дәрігерлер жоқ'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDoctors.map(doc => (
                        <div
                          key={doc.id}
                          className={`p-6 border-2 transition-all cursor-pointer group ${
                            selectedDoctor === doc.id
                              ? 'border-blue-600 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]'
                              : 'border-primary-900 hover:border-blue-600'
                          }`}
                          onClick={() => setSelectedDoctor(doc.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-black text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">{doc.name}</p>
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-2">{doc.specialization || 'Мамандығы жоқ'}</p>
                              {doc.experienceYears && (
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{doc.experienceYears} жыл тәжірибе</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDoctorProfile(doc);
                              }}
                              className="ml-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors underline underline-offset-4"
                            >
                              Профиль
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {selectedService && selectedDoctor && (
                <Card title="3. Уақыт таңдау">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-black text-primary-900 uppercase tracking-widest mb-3">Күнді таңдаңыз</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border-2 border-primary-900 rounded-none focus:bg-primary-50 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-bold uppercase tracking-widest text-xs"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime(''); // Сбрасываем выбранное время при смене даты
                          }}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-primary-900 uppercase tracking-widest mb-3">Уақытты таңдаңыз</label>
                        {loadingSlots ? (
                          <div className="w-full px-4 py-3 border-2 border-primary-100 rounded-none bg-primary-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Жүктелуде...</span>
                          </div>
                        ) : allTimeSlots.length === 0 ? (
                          <div className="w-full px-4 py-3 border-2 border-primary-100 rounded-none bg-primary-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {selectedDate ? 'Бұл күні бос уақыт жоқ' : 'Алдымен күнді таңдаңыз'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                            {allTimeSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => {
                                  if (slot.available) {
                                    setSelectedTime(slot.time);
                                  }
                                }}
                                disabled={!slot.available}
                                className={`py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                  !slot.available
                                    ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                                    : selectedTime === slot.time
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-[2px_2px_0px_0px_rgba(30,58,138,1)]'
                                    : 'bg-white text-primary-900 border-primary-900 hover:border-blue-600 hover:text-blue-600'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-primary-900 uppercase tracking-widest mb-3">Қосымша ескертулер (міндетті емес)</label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-primary-900 rounded-none focus:bg-primary-50 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium min-h-[100px]"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Мысалы: тіс ауруы, тексерілу..."
                      />
                    </div>
                  </div>
                  
                  {selectedService && selectedDoctor && selectedDate && selectedTime && (
                    <div className="mt-8 pt-8 border-t-4 border-primary-900">
                      <div className="bg-primary-50 p-6 border-2 border-primary-900 mb-6">
                        <h5 className="font-black uppercase tracking-widest text-xs mb-4 text-blue-600">Жазылу мәліметтері:</h5>
                        <div className="space-y-2">
                          <p className="flex justify-between font-bold uppercase tracking-wider text-[10px]"><span className="text-gray-400">Қызмет:</span> {services.find(s => s.id === selectedService)?.name}</p>
                          <p className="flex justify-between font-bold uppercase tracking-wider text-[10px]"><span className="text-gray-400">Дәрігер:</span> {doctors.find(d => d.id === selectedDoctor)?.name}</p>
                          <p className="flex justify-between font-bold uppercase tracking-wider text-[10px]"><span className="text-gray-400">Күні мен уақыты:</span> {selectedDate}, {selectedTime}</p>
                          <p className="flex justify-between font-black uppercase tracking-widest text-sm pt-2 border-t border-primary-200"><span>Жиыны:</span> <span className="text-blue-600">{services.find(s => s.id === selectedService)?.price.toLocaleString()} ₸</span></p>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="w-full bg-blue-600 text-white hover:bg-white hover:text-blue-600 border-blue-600"
                        onClick={handleBooking}
                        disabled={!selectedService || !selectedDoctor || !selectedDate || !selectedTime}
                        isLoading={bookingLoading}
                      >
                        Жазылуды растау
                      </Button>
                    </div>
                  )}
                </Card>
              )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeSubTab === 'active' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSubTab('active')}
              >
                Белсенді жазылулар
                {activeSubTab === 'active' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                )}
              </button>
              <button
                className={`pb-4 px-6 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeSubTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSubTab('history')}
              >
                Емдеу тарихы
                {activeSubTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                )}
              </button>
            </div>

            {activeSubTab === 'active' ? (
              <div className="space-y-4">
                {loadingAppointments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} height={120} />
                    ))}
                  </div>
                ) : appointments.filter(app => app.status !== AppointmentStatus.COMPLETED && app.status !== AppointmentStatus.DONE && app.status !== AppointmentStatus.CANCELLED).length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="Белсенді жазылулар жоқ"
                    description="Сізде қазіргі уақытта белсенді қабылдаулар жоқ."
                  />
                ) : (
                  appointments
                    .filter(app => app.status !== AppointmentStatus.COMPLETED && app.status !== AppointmentStatus.DONE && app.status !== AppointmentStatus.CANCELLED)
                    .map(app => (
                      <Card key={app.id}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-none border-2 border-blue-600">
                              <Calendar className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-lg uppercase tracking-tight">{app.serviceName}</h4>
                              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{app.doctorName}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                <span className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1" /> {app.date}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> {app.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <span
                              className="px-4 py-1 border-2 border-blue-600 text-blue-600 text-xs font-black uppercase tracking-widest"
                            >
                              {AppointmentStatusLabels[app.status] || app.status}
                            </span>
                            <Button
                              variant="danger"
                              size="sm"
                              className="rounded-none"
                              onClick={() => {
                                setAppointmentToCancel(app.id);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Күшін жою
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {loadingRecords ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} height={120} />
                    ))}
                  </div>
                ) : medicalRecords.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Емдеу тарихы бос"
                    description="Сіздің аяқталған емдеу шараларыңыз әлі жоқ."
                  />
                ) : (
                  medicalRecords.map(record => (
                    <Card key={record.id} className="hover:border-blue-600 transition-colors cursor-pointer" onClick={() => {
                      setSelectedRecord(record);
                      setRecordModalOpen(true);
                    }}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-50 p-3 rounded-none border-2 border-green-600">
                            <FileText className="text-green-600 w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg uppercase tracking-tight">{record.appointment?.service?.name || 'Стоматологиялық қызмет'}</h4>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{record.doctor?.fullName || 'Дәрігер'}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                              <span className="flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" /> {record.appointment ? new Date(record.appointment.appointmentDate).toLocaleDateString('kk-KZ') : ''}
                              </span>
                              {record.diagnosis && (
                                <span className="flex items-center text-blue-600 font-bold italic">
                                  <Award className="w-3.5 h-3.5 mr-1" /> Диагноз қойылды
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-none border-2"
                            onClick={() => {
                              setSelectedRecord(record);
                              setRecordModalOpen(true);
                            }}
                          >
                            Толығырақ
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="rounded-none bg-blue-600"
                            isLoading={downloadingPdf === record.appointmentId}
                            onClick={() => handleDownloadPDF(record.appointmentId)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            PDF жүктеу
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
            {loadingPayments ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} height={60} />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Төлемдер жоқ"
                description="Сізде әлі төлемдер жоқ."
              />
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Қызмет</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Уақыты</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сома</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статусы</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Әрекет</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {payment.amount.toLocaleString()} ₸
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === PaymentStatus.PAID 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === PaymentStatus.PENDING
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {PaymentStatusLabels[payment.status as PaymentStatus] || payment.status}
                          </span>
                          {payment.paymentMethod && (
                            <span className="text-xs text-gray-500">
                              {PaymentMethodLabels[payment.paymentMethod as PaymentMethod]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {payment.status === PaymentStatus.PAID ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            onClick={() => handleDownloadReceipt(payment.id)}
                          >
                            <FileText className="w-4 h-4 mr-1" /> Чек
                          </Button>
                        ) : payment.status === PaymentStatus.PENDING ? (
                          <span className="text-sm text-gray-500 italic">Растау күтілуде</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setAppointmentToCancel(null);
        }}
        onConfirm={handleCancelAppointment}
        title="Қабылдауды күшін жою"
        message="Сіз шынымен бұл қабылдауды күшін жойғыңыз келе ме?"
        confirmText="Иә, күшін жою"
        cancelText="Жоқ"
        variant="danger"
      />

      {/* Medical Record Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => {
          setRecordModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Емдеу мәліметтері"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 border-2 border-blue-600">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Қызмет</p>
                <p className="font-bold text-lg text-blue-900">{selectedRecord.appointment?.service?.name}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Дәрігер</p>
                <p className="font-bold text-lg text-blue-900">{selectedRecord.doctor?.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Күні</p>
                <p className="font-bold text-blue-900">{new Date(selectedRecord.appointment?.appointmentDate).toLocaleDateString('kk-KZ')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedRecord.diagnosis && (
                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <h5 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2 italic">Диагноз:</h5>
                  <p className="text-gray-700 font-medium leading-relaxed">{selectedRecord.diagnosis}</p>
                </div>
              )}
              {selectedRecord.treatment && (
                <div className="border-l-4 border-green-600 pl-4 py-2">
                  <h5 className="text-sm font-black text-green-900 uppercase tracking-widest mb-2 italic">Емдеу:</h5>
                  <p className="text-gray-700 font-medium leading-relaxed">{selectedRecord.treatment}</p>
                </div>
              )}
              {selectedRecord.prescriptions && (
                <div className="border-l-4 border-yellow-600 pl-4 py-2">
                  <h5 className="text-sm font-black text-yellow-900 uppercase tracking-widest mb-2 italic">Нұсқаулар мен дәрілер:</h5>
                  <p className="text-gray-700 font-medium leading-relaxed">{selectedRecord.prescriptions}</p>
                </div>
              )}
              {selectedRecord.notes && (
                <div className="border-l-4 border-gray-400 pl-4 py-2">
                  <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2 italic">Ескертулер:</h5>
                  <p className="text-gray-700 font-medium leading-relaxed">{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <Button
                variant="primary"
                className="bg-blue-600 rounded-none w-full md:w-auto"
                isLoading={downloadingPdf === selectedRecord.appointmentId}
                onClick={() => handleDownloadPDF(selectedRecord.appointmentId)}
              >
                <FileText className="w-5 h-5 mr-2" />
                Емдеу жоспарын жүктеу (PDF)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Doctor Profile Modal */}
      <Modal
        isOpen={doctorProfileOpen}
        onClose={() => {
          setDoctorProfileOpen(false);
          setSelectedDoctorForProfile(null);
        }}
        title="Дәрігер профилі"
        size="md"
      >
        {selectedDoctorForProfile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedDoctorForProfile.name}</h3>
                <p className="text-gray-600">{selectedDoctorForProfile.specialization}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedDoctorForProfile.experienceYears && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Тәжірибе</p>
                    <p className="font-semibold">{selectedDoctorForProfile.experienceYears} жыл</p>
                  </div>
                </div>
              )}

              {selectedDoctorForProfile.specialization && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Мамандығы</p>
                    <p className="font-semibold">{selectedDoctorForProfile.specialization}</p>
                  </div>
                </div>
              )}

              {selectedDoctorForProfile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{selectedDoctorForProfile.email}</p>
                  </div>
                </div>
              )}

              {selectedDoctorForProfile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-semibold">{selectedDoctorForProfile.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedDoctor(selectedDoctorForProfile.id);
                  setDoctorProfileOpen(false);
                  setSelectedDoctorForProfile(null);
                }}
              >
                Бұл дәрігерді таңдау
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setAppointmentForPayment(null);
          setPaymentMethod('card');
          setCardNumber('');
          setCardExpiry('');
          setCardCvv('');
          setActiveTab('appointments');
          loadAppointments();
        }}
        title="Төлем"
        size="md"
      >
        {appointmentForPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Қызмет:</span>
                <span className="font-semibold">{appointmentForPayment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Дәрігер:</span>
                <span className="font-semibold">{appointmentForPayment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Күні:</span>
                <span className="font-semibold">{appointmentForPayment.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Уақыты:</span>
                <span className="font-semibold">{appointmentForPayment.time}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Жалпы сома:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {appointmentForPayment.servicePrice?.toLocaleString() || 0} ₸
                </span>
              </div>

              {/* Выбор способа оплаты */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Төлем тәсілі
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Банк картасы
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Қолма-қол ақша
                  </button>
                </div>
              </div>

              {/* Форма для карты */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Карта нөмірі (16 цифр)
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Мерзімі (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV (3 цифр)
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => {
                          const numbers = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setCardCvv(numbers);
                        }}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreatePayment}
              >
                Төлеу
              </Button>

              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setAppointmentForPayment(null);
                  setPaymentMethod('card');
                  setCardNumber('');
                  setCardExpiry('');
                  setCardCvv('');
                  setActiveTab('appointments');
                  loadAppointments();
                }}
              >
                Кейінірек төлеу
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setAppointmentForReview(null);
          setReviewRating(0);
          setReviewComment('');
        }}
        title="Пікір қалдыру"
      >
        {appointmentForReview && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Дәрігер:</p>
              <p className="font-semibold">{appointmentForReview.doctorName}</p>
              <p className="text-sm text-gray-600 mt-2 mb-1">Қызмет:</p>
              <p className="font-semibold">{appointmentForReview.serviceName}</p>
              <p className="text-sm text-gray-600 mt-2 mb-1">Күні:</p>
              <p className="font-semibold">{appointmentForReview.date} {appointmentForReview.time}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Рейтинг <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      reviewRating >= rating
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {reviewRating === 5 && 'Керемет!'}
                  {reviewRating === 4 && 'Жақсы'}
                  {reviewRating === 3 && 'Қанағаттанарлық'}
                  {reviewRating === 2 && 'Нашар'}
                  {reviewRating === 1 && 'Өте нашар'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пікір (міндетті емес)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Пікіріңізді жазыңыз..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewComment.length}/2000 символ
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setReviewModalOpen(false);
                  setAppointmentForReview(null);
                  setReviewRating(0);
                  setReviewComment('');
                }}
              >
                Бас тарту
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0}
                isLoading={submittingReview}
              >
                Жіберу
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientDashboard;
